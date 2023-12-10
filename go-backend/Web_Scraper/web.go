package web

import (
	"fmt"
	"path/filepath"
	"encoding/base64"
	"time"
	"context"
	pg "fishhunter-server/Db"
	tools "fishhunter-server/Tools"
	"github.com/mafredri/cdp"
	"github.com/mafredri/cdp/devtool"
	"github.com/mafredri/cdp/protocol/dom"
	"github.com/mafredri/cdp/protocol/page"
	"github.com/mafredri/cdp/rpcc"

	// "io/ioutil"
	"strings"
	"bytes"
	// "strconv"
	"bufio"
	"log"
	"os"

	"github.com/gocolly/colly/v2"
	"github.com/sergi/go-diff/diffmatchpatch"
	"golang.org/x/net/idna"
	"github.com/carlogit/phash"
)

func checkTwoWithHTML(html1 string, html2 string) (bool) {
	// Преобразование HTML в текстовый формат (удаление тегов и пробелов)
	text1 := stripHTML(string(html1))
	text2 := stripHTML(string(html2))

	// Использование алгоритма сравнения последовательностей
	dmp := diffmatchpatch.New()
	diffs := dmp.DiffMain(text1, text2, false)
	similarityPercentage := calculateSimilarity(diffs)

	// Вывод результата
	if (similarityPercentage > 50) {
		return true
	} else {
		return false
	}
	
}

func CheckWithTitle(stopChan chan struct{}, title string, domain_zone string) {
	filePrefix := domain_zone + "_domains.txt_part"
	c := colly.NewCollector(
		colly.Async(),
	)

	// set a valid User-Agent header
	c.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
	c.Limit(&colly.LimitRule{DomainGlob: "*", Parallelism: 300})

	c.OnHTML("title", func(e *colly.HTMLElement) {
		select {
		case <-stopChan:
			return
		default:
			// Продолжаем выполнение

			if e.Text == title {
				fmt.Println(e.Text)
				fileW, errW := os.OpenFile("result.txt", os.O_APPEND|os.O_WRONLY, 0600)

				if errW != nil {
					fmt.Println("Unable to open file:", errW)
					os.Exit(1)
				}
				defer fileW.Close()
				fileW.WriteString(e.Request.URL.Host + "\n")
			}
		}
	})

	files, err := filepath.Glob(fmt.Sprintf("domains/%s*.txt", filePrefix))
	if err != nil {
		log.Fatal(err)
	}

	for _, fileName := range files {
		file, err := os.Open(fileName)
		if err != nil {
			log.Fatal(err)
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			a := strings.Split(scanner.Text(), ";")[0]
			if domain_zone == "rf" {
				p := idna.New()
				url, _ := p.ToUnicode(strings.ToLower(a))
				c.Visit("https://" + url)
			} else {
				c.Visit("https://" + a)
			}
		}

		if err := scanner.Err(); err != nil {
			log.Fatal(err)
		}
	}

	

	c.Wait()
}

func CheckTwoWithScreenshot(image1 []byte, image2 []byte) (int) {
	a, _ := hash(image1)
    b, _ := hash(image2)
    distance := phash.GetDistance(a, b)
	return distance
}

func hash(imageData []byte) (string, error) {
	imgReader := bytes.NewReader(imageData)

	ahash, err := phash.GetHash(imgReader)
	if err != nil {
		return "", err
	}

	// Преобразуем хеш в строку и возвращаем
	return fmt.Sprintf("%x", ahash), nil
}

func CheckAll(stopChan chan struct{}, url string, domain_zone string, db pg.Database) {
	fmt.Println("STart")
	filePrefix := domain_zone + "_domains.txt_part"

	timeout := 5 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	devt := devtool.New("http://127.0.0.1:9222")
	pt, err := devt.Get(ctx, devtool.Page)
	if err != nil {
		pt, err = devt.Create(ctx)
		if err != nil {
			return 
		}
	}


	conn, err := rpcc.DialContext(ctx, pt.WebSocketDebuggerURL)
	if err != nil {
		return 
	}
	defer conn.Close() 

	c := cdp.NewClient(conn)

	
	domContent, err := c.Page.DOMContentEventFired(ctx)
	if err != nil {
		return 
	}
	defer domContent.Close()

	if err = c.Page.Enable(ctx); err != nil {
		return
	}

	navArgs := page.NewNavigateArgs(url)
	_, err = c.Page.Navigate(ctx, navArgs)
	if err != nil {
		return 
	}

	// Wait until we have a DOMContentEventFired event.
	if _, err = domContent.Recv(); err != nil {
		return 
	}

	// fmt.Printf("Page loaded with frame ID: %s\n", nav.FrameID)

	doc, err := c.DOM.GetDocument(ctx, nil)
	if err != nil {
		return
	}

	siteHTML, err := c.DOM.GetOuterHTML(ctx, &dom.GetOuterHTMLArgs{
		NodeID: &doc.Root.NodeID,
	})
	if err != nil {
		return 
	}

	// fmt.Printf("HTML: %s\n", result.OuterHTML)

	targetTag := "title"
	siteTitle, err := tools.FindTag(siteHTML.OuterHTML, targetTag)
	if err != nil {
		return 
	}

	// fmt.Printf("Content of <%s>: %s\n", targetTag, title)
	

	// Capture a screenshot of the current page.
	screenshotArgs := page.NewCaptureScreenshotArgs().
		SetFormat("jpeg").
		SetQuality(80)
	siteScreenshot, err := c.Page.CaptureScreenshot(ctx, screenshotArgs)
	if err != nil {
		return
	}

	fmt.Println(siteTitle)
	
	files, err := filepath.Glob(fmt.Sprintf("domains/%s*.txt", filePrefix))
	if err != nil {
		log.Fatal(err)
	}

	for _, fileName := range files {
		file, err := os.Open(fileName)
		if err != nil {
			log.Fatal(err)
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			select {
			case <-stopChan:
				return
			default:
				a := strings.Split(scanner.Text(), ";")[0]
				p := idna.New()
				a, _ = p.ToUnicode(strings.ToLower(a))
				// sadfasdf

				navArgs := page.NewNavigateArgs("https://" + a)
				_, err = c.Page.Navigate(ctx, navArgs)
				if err != nil {
					return
				}

				if _, err = domContent.Recv(); err != nil {
					return 
				}

				// fmt.Printf("Page loaded with frame ID: %s\n", nav.FrameID)

				
				doc, err := c.DOM.GetDocument(ctx, nil)
				if err != nil {
					return
				}

				// Get the outer HTML for the page.
				result, err := c.DOM.GetOuterHTML(ctx, &dom.GetOuterHTMLArgs{
					NodeID: &doc.Root.NodeID,
				})
				if err != nil {
					return 
				}

				// fmt.Printf("HTML: %s\n", result.OuterHTML)

				targetTag := "title"
				title, err := tools.FindTag(result.OuterHTML, targetTag)
				if err != nil {
					return 
				}

				// fmt.Printf("Content of <%s>: %s\n", targetTag, title)
				

				// Capture a screenshot of the current page.
				screenshotArgs := page.NewCaptureScreenshotArgs().
					SetFormat("jpeg").
					SetQuality(80)
				screenshot, err := c.Page.CaptureScreenshot(ctx, screenshotArgs)
				if err != nil {
					return
				}


				if (title == siteTitle) {
					db.AddNewClone("https://" + a, url, title, base64.StdEncoding.EncodeToString(screenshot.Data), "title")
				}
				if (checkTwoWithHTML(siteHTML.OuterHTML, result.OuterHTML)){
					db.AddNewClone("https://" + a, url, title, base64.StdEncoding.EncodeToString(screenshot.Data), "HTML")
				}

				distance := CheckTwoWithScreenshot(siteScreenshot.Data, screenshot.Data)
				if (distance <= 15) {
					db.AddNewClone("https://" + a, url, title, base64.StdEncoding.EncodeToString(screenshot.Data), "screenshot")
				}
			}


			//rsfasdfa
		}

		if err := scanner.Err(); err != nil {
			log.Fatal(err)
		}
	}



}

// stripHTML удаляет HTML теги и пробелы из текста
func stripHTML(html string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(html)), " ")
}

// calculateSimilarity рассчитывает процент схожести на основе результата алгоритма сравнения
func calculateSimilarity(diffs []diffmatchpatch.Diff) float64 {
	commonLength := 0
	for _, diff := range diffs {
		if diff.Type == diffmatchpatch.DiffEqual {
			commonLength += len(diff.Text)
		}
	}

	totalLength := len(diffs)
	if totalLength == 0 {
		return 100.0
	}

	similarityPercentage := float64(commonLength) / float64(totalLength)
	return similarityPercentage
}
