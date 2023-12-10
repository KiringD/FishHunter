package main

import (
	"net/http"
	// "time"

	"encoding/json"
	pg "fishhunter-server/Db"
	screenshoter "fishhunter-server/Screenshoter"
	tools "fishhunter-server/Tools"
	web "fishhunter-server/Web_Scraper"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	// "idna"
	// "github.com/gocolly/colly/v2"
)

type RequestData struct {
	Action string      `json:"action"`
	Data   interface{} `json:"data"`
}

type Credentials struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type CredentialsRegister struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Units struct {
	Id          int64  `json:"id"`
	Title       string `json:"title"`
	Search_perc int    `json:"search_perc"`
	Preview     string `json:"preview"`
	User_id     int    `json:"user_id"`
	Url         string `json:"url"`
	Auto_search bool   `json:"auto_search"`
	Rf          bool   `json:"rf"`
	Ru          bool   `json:"ru"`
}

func main() {
	// web.CheckWithTitle("Национальный студенческий хакатон", "ru")

	// tools.DownloadRfList()
	// tools.DownloadRuList()
	

	// html1, _ := tools.GetHTML("https://арчеводы.рф")
	// html2, _ := tools.GetHTML("https://цифровой-суверенитет.рф")

	// web.CheckWithHTML(html1, html2)

	db := pg.New("postgres", "postgres", "127.0.0.1", 5432)
	// fmt.Printf("type of a is %T\n", db)
	// db.InsertUser("user", "password")
	// stopChan := make(chan struct{})
	// go web.CheckAll(stopChan, "https://цифровой-суверенитет.рф", "rf", db)
	// stopChan := make(chan struct{})
	// go web.CheckWithTitle(stopChan, "Национальный студенческий хакатон", "rf")

	// time.Sleep(3 * time.Second)

	// // Отправляем сигнал об остановке асинхронной функции
	// close(stopChan)

	http.HandleFunc("/api/download", downloadHandler)
	// http.HandleFunc("/api/login", loginHandler)
	http.HandleFunc("/api/upload", func(w http.ResponseWriter, r *http.Request) {
		uploadHandler(w, r, db)
	})
	http.ListenAndServe(":8080", nil)
}

func downloadHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GGG")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	// Получаем имя файла из параметра запроса
	fileName := r.URL.Query().Get("file")

	// Проверяем, что имя файла не пустое
	if fileName == "" {
		http.Error(w, "Не указано имя файла", http.StatusBadRequest)
		return
	}

	// Проверяем, что файл существует
	filePath := filepath.Join("img", fileName) // Укажите свой путь к папке
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "Файл не найден", http.StatusNotFound)
		return
	}

	// Открываем файл
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "Ошибка открытия файла", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Устанавливаем заголовок Content-Disposition для скачивания файла
	w.Header().Set("Content-Disposition", "attachment; filename="+fileName)

	// Копируем содержимое файла в ответ
	_, err = io.Copy(w, file)
	if err != nil {
		http.Error(w, "Ошибка отправки файла", http.StatusInternalServerError)
		return
	}
}


func uploadHandler(w http.ResponseWriter, r *http.Request, db pg.Database) {
	fmt.Println("Handling upload request")

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Methods", "POST, PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Проверяем метод запроса
	if r.Method != http.MethodPut {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	// Читаем тело запроса
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Println("Ошибка чтения тела запроса:", err)
		http.Error(w, "Ошибка чтения тела запроса", http.StatusInternalServerError)
		return
	}

	// Выводим содержимое тела запроса для отладки
	fmt.Println("Тело запроса:", string(body))

	// Декодируем JSON-данные из тела запроса в структуру RequestData
	var requestData RequestData
	err = json.Unmarshal(body, &requestData)
	if err != nil {
		fmt.Println("Ошибка декодирования JSON:", err)
		http.Error(w, "Ошибка декодирования JSON", http.StatusBadRequest)
		return
	}

	// Выводим декодированные данные для отладки
	fmt.Printf("Декодированные данные: %+v\n", requestData)

	// Обработка данных в зависимости от значения ключа "action"
	switch requestData.Action {
	case "register":
		registerUser(r, requestData, w, db)
	case "login":
		var credentials Credentials
		// Преобразование интерфейса в Credentials
		credentialsMap, ok := requestData.Data.(map[string]interface{})
		if !ok {
			http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
			return
		}
		credentials.Login, _ = credentialsMap["login"].(string)
		credentials.Password, _ = credentialsMap["password"].(string)

		user_id, err := db.GetUserId(credentials.Login, credentials.Password)
		if err != nil {
			http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
			return
		}
		data := make(map[string]string)
		data["token"], _ = tools.GenerateToken(user_id)

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(data)
	case "unit":
		addSite(r, requestData, w, db)
	case "deleteUnit":
		data, ok := requestData.Data.(map[string]interface{})
		if !ok {
			http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
			return
		}
		unit_id_float, _ := data["unit_id"].(float64)
		unit_id := int64(unit_id_float)

		user_id, err := tools.AuthMiddleware(w, r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		err = db.DeleteUnit(user_id, unit_id)
		if err != nil {
			http.Error(w, "", http.StatusUnauthorized)
		}
		w.WriteHeader(http.StatusOK)

	case "units":
		user_id, err := tools.AuthMiddleware(w, r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var units []pg.Unit
		units, err = db.GetUserUnits(user_id)
		if err != nil {
			log.Printf("%v", err)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(units)
	case "username":
		user_id, err := tools.AuthMiddleware(w, r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		data, _ := db.GetUserName(user_id)

		fmt.Println(data, err)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(data)
	case "clones":
		url, ok := requestData.Data.(string)
		if !ok {
			http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
			return
		}
		var clones []pg.Clone 
		clones, _ = db.GetSiteClones(url)

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(clones)
	case "deleteClone":
		clone_id_float, ok := requestData.Data.(float64)
		if !ok {
			http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
			return
		}
		clone_id := int64(clone_id_float)
		 err = db.DeleteClone(clone_id)
		 if err != nil {
			log.Println(err)
		 }

		w.WriteHeader(http.StatusOK)
	case "manualSearch":
		site_url, ok := requestData.Data.(string)
		if !ok {
			http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
			return
		}
		stopChan := make(chan struct{})
		go web.CheckAll(stopChan, site_url, "rf", db)

		w.WriteHeader(http.StatusOK)
	default:
		http.Error(w, "Неизвестное действие", http.StatusBadRequest)
		return
	}



}

func registerUser(r *http.Request, requestData RequestData, w http.ResponseWriter, db pg.Database) {
	var credentials CredentialsRegister
	// Преобразование интерфейса в Credentials
	credentialsMap, ok := requestData.Data.(map[string]interface{})
	if !ok {
		http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
		return
	}

	credentials.Name, _ = credentialsMap["name"].(string)
	credentials.Email, _ = credentialsMap["email"].(string)
	credentials.Password, _ = credentialsMap["password"].(string)

	fmt.Printf("Данные для бд: %+v\n", credentials)

	// if (!tools.SiteExists(unit.Url)){
	// 	http.Error(w, "Сайт не существует: " + unit.Url, http.StatusBadRequest)
	// 	return
	// }

	err := db.AddNewUser(credentials.Email, credentials.Name, credentials.Password)
	// fmt.Println(err.Error())

	data := make(map[string]string)
	// fmt.Println(id)
	if err != nil {
		fmt.Println(1)
		data["code"] = "1"
		data["message"] = err.Error()
	} else {
		fmt.Println(2)
		data["code"] = "0"
		data["message"] = "Success"
	}

	fmt.Println(data)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)

}

func addSite(r *http.Request, requestData RequestData, w http.ResponseWriter, db pg.Database) {
	var unit Units
	// Преобразование интерфейса в Credentials
	unitMap, ok := requestData.Data.(map[string]interface{})
	if !ok {
		http.Error(w, "Ошибка преобразования данных", http.StatusBadRequest)
		return
	}

	user_id, err := tools.AuthMiddleware(w, r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	unit.Url, _ = unitMap["url"].(string)
	unit.Url = "https://" + unit.Url
	unit.Auto_search, _ = unitMap["auto_search"].(bool)
	unit.Rf, _ = unitMap["rf"].(bool)
	unit.Ru, _ = unitMap["ru"].(bool)
	// Теперь у вас есть данные для авторизации (credentials.Login и credentials.Password)
	fmt.Printf("Данные для бд: %+v\n", unit)

	if !tools.SiteExists(unit.Url) {
		http.Error(w, "Сайт не существует: "+unit.Url, http.StatusBadRequest)
		return
	}

	picture, title, err := screenshoter.Screenshot(unit.Url)
	if err != nil {
		return
	}

	unit.Title = title
	unit.Preview = picture
	unit.Search_perc = 0
	unit.Id = db.AddNewUnit(user_id, unit.Auto_search, unit.Ru, unit.Rf, picture, title, unit.Url)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(unit)

}
