package screenshot

import (
	// "bufio"
	"context"
	// "fmt"
	// "io/ioutil"
	// "log"
	// "os"
	// "strings"
	"time"
	// "errors"
	"encoding/base64"
	// "golang.org/x/net/html"
	// "net/http"
	tools "fishhunter-server/Tools"


	"github.com/mafredri/cdp"
	"github.com/mafredri/cdp/devtool"
	"github.com/mafredri/cdp/protocol/dom"
	"github.com/mafredri/cdp/protocol/page"
	"github.com/mafredri/cdp/rpcc"
)

func main() {
	// err := run()
	// if err != nil {
	// 	log.Fatal(err)
	// }
}


func Screenshot(url string) (string, string, error) {
	timeout := 5 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	devt := devtool.New("http://127.0.0.1:9222")
	pt, err := devt.Get(ctx, devtool.Page)
	if err != nil {
		pt, err = devt.Create(ctx)
		if err != nil {
			return "", "", err
		}
	}

	conn, err := rpcc.DialContext(ctx, pt.WebSocketDebuggerURL)
	if err != nil {
		return "", "", err
	}
	defer conn.Close() 

	c := cdp.NewClient(conn)
	
	domContent, err := c.Page.DOMContentEventFired(ctx)
	if err != nil {
		return "", "", err
	}
	defer domContent.Close()


	if err = c.Page.Enable(ctx); err != nil {
		return "", "", err
	}

	navArgs := page.NewNavigateArgs(url)
	_, err = c.Page.Navigate(ctx, navArgs)
	if err != nil {
		return "", "", err
	}

	if _, err = domContent.Recv(); err != nil {
		return "", "", err
	}

	// fmt.Printf("Page loaded with frame ID: %s\n", nav.FrameID)

	doc, err := c.DOM.GetDocument(ctx, nil)
	if err != nil {
		return "", "", err
	}

	result, err := c.DOM.GetOuterHTML(ctx, &dom.GetOuterHTMLArgs{
		NodeID: &doc.Root.NodeID,
	})
	if err != nil {
		return "", "", err
	}

	// fmt.Printf("HTML: %s\n", result.OuterHTML)

	targetTag := "title"
	title, err := tools.FindTag(result.OuterHTML, targetTag)
	if err != nil {
		return "", "", err
	}

	// fmt.Printf("Content of <%s>: %s\n", targetTag, title)
	

	// Capture a screenshot of the current page.
	screenshotArgs := page.NewCaptureScreenshotArgs().
		SetFormat("jpeg").
		SetQuality(80)
	screenshot, err := c.Page.CaptureScreenshot(ctx, screenshotArgs)
	if err != nil {
		return "", "", err
	}
	
	base64Screenshot := base64.StdEncoding.EncodeToString(screenshot.Data)

	return base64Screenshot, title, nil
}
