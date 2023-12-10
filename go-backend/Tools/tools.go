package tools

import (
	"fmt"
	"net/http"
	"strings"
	"errors"
	"io/ioutil"
	"os"
	"io"
    "log"
	"archive/zip"
	"path/filepath"
	"bufio"


	"github.com/dgrijalva/jwt-go"
	"golang.org/x/net/html"
)

func FindTag(htmlString, targetTag string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlString))
	if err != nil {
		return "", err
	}

	var find func(*html.Node) string
	find = func(n *html.Node) string {
		if n.Type == html.ElementNode && n.Data == targetTag {
			return text(n)
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			if result := find(c); result != "" {
				return result
			}
		}
		return ""
	}

	return find(doc), nil
}

func text(n *html.Node) string {
	var result string
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.TextNode {
			result += strings.TrimSpace(c.Data)
		} else {
			result += text(c)
		}
	}
	return result
}

func SiteExists(url string) bool {
	resp, err := http.Head(url)
	if err != nil {
		return false
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return true
	}

	return false
}

// Пример создания и подписи токена
func GenerateToken(userID int64) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		// Другие данные, которые вы хотите включить в токен
	})

	tokenString, err := token.SignedString([]byte("eQ9IPpJMwiMvY4uCld5Y7riQNpgJ4MJT257VtYIsOAU="))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// Пример миддлвара для проверки токена
func AuthMiddleware(w http.ResponseWriter, r *http.Request) (int64, error) {
    tokenString := extractTokenFromRequest(r)
    if tokenString == "" {
        return 0, errors.New("Unauthorized")
    }

    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte("eQ9IPpJMwiMvY4uCld5Y7riQNpgJ4MJT257VtYIsOAU="), nil
    })

    if err != nil || !token.Valid {
        return 0, errors.New("Unauthorized")
    }

	user_id, err := extractClaims(token)
	if err != nil {
		return 0, err
	}

    return user_id, nil
}

func extractTokenFromRequest(r *http.Request) string {
	// Получение значения заголовка Authorization
	token := r.Header.Get("Authorization")
	fmt.Println(token)

	// Проверка, что значение заголовка непустое и начинается с "Bearer "
	if token != "" {
		parts := strings.Split(token, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
	}

	return ""
}

func extractClaims (token *jwt.Token) (int64, error) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
			// fmt.Println(claims["user_id"])
			user_id_float := claims["user_id"].(float64)
			user_id := int64(user_id_float)
			return user_id, nil
	}
	return 0, errors.New("Unable to extract claims")
}

func GetHTML(url string) (string, error) {
	// Make a GET request to the URL
	response, err := http.Get(url)
	if err != nil {
		// fmt.Println("Error making GET request:", err)
		return "", err
	}
	defer response.Body.Close()

	// Read the response body
	html, err := ioutil.ReadAll(response.Body)
	if err != nil {
		// fmt.Println("Error reading response body:", err)
		return "", err
	}

	// Print the HTML content
	return string(html), nil
}

func DownloadRuList(){
	fullURLFile := "https://statonline.ru/domainlist/file?tld=ru"
 
    // Build fileName from fullPath
    fileName := "ru_domains.zip"
 
    // Create blank file
    file, err := os.Create(fileName)
    if err != nil {
        log.Fatal(err)
    }
    client := http.Client{
        CheckRedirect: func(r *http.Request, via []*http.Request) error {
            r.URL.Opaque = r.URL.Path
            return nil
        },
    }
    // Put content on file
    resp, err := client.Get(fullURLFile)
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
 
    size, err := io.Copy(file, resp.Body)
 
    defer file.Close()

	unzip("ru_domains.zip")

	splitFile("domains/ru_domains.txt", 500000)
 
    fmt.Printf("Downloaded a file %s with size %d", fileName, size)
}

func DownloadRfList(){
	fullURLFile := "https://statonline.ru/domainlist/file?tld=rf"
 
    // Build fileName from fullPath
    fileName := "rf_domains.zip"
 
    // Create blank file
    file, err := os.Create(fileName)
    if err != nil {
        log.Fatal(err)
    }
    client := http.Client{
        CheckRedirect: func(r *http.Request, via []*http.Request) error {
            r.URL.Opaque = r.URL.Path
            return nil
        },
    }
    // Put content on file
    resp, err := client.Get(fullURLFile)
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
 
    size, err := io.Copy(file, resp.Body)
 
    defer file.Close()

	unzip("rf_domains.zip")

	splitFile("domains/rf_domains.txt", 500000)
 
    fmt.Printf("Downloaded a file %s with size %d", fileName, size)
}

func unzip(zipFile string) {
	dst := "domains"
    archive, err := zip.OpenReader(zipFile)
    if err != nil {
        panic(err)
    }
    defer archive.Close()

    for _, f := range archive.File {
        filePath := filepath.Join(dst, f.Name)
        fmt.Println("unzipping file ", filePath)

        if !strings.HasPrefix(filePath, filepath.Clean(dst)+string(os.PathSeparator)) {
            fmt.Println("invalid file path")
            return
        }
        if f.FileInfo().IsDir() {
            fmt.Println("creating directory...")
            os.MkdirAll(filePath, os.ModePerm)
            continue
        }

        if err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm); err != nil {
            panic(err)
        }

        dstFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
        if err != nil {
            panic(err)
        }

        fileInArchive, err := f.Open()
        if err != nil {
            panic(err)
        }

        if _, err := io.Copy(dstFile, fileInArchive); err != nil {
            panic(err)
        }

        dstFile.Close()
        fileInArchive.Close()
    }

}

func splitFile(inputFilePath string, linesPerFile int) error {
	file, err := os.Open(inputFilePath)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	fileCount := 1
	lineCount := 0

	for scanner.Scan() {
		line := scanner.Text()
		lineCount++

		outputFileName := fmt.Sprintf("%s_part%d.txt", inputFilePath, fileCount)
		outputFile, err := os.OpenFile(outputFileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			return err
		}

		_, err = outputFile.WriteString(line + "\n")
		outputFile.Close()

		if err != nil {
			return err
		}

		if lineCount >= linesPerFile {
			lineCount = 0
			fileCount++
		}
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	return nil
}
