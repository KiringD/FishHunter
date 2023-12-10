package pg

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"strings"
	"strconv"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	user     string
	password string
	ip       string
	port     int
	url      string
	pool     *pgxpool.Pool
}

type Unit struct {
	Id 			int64	`json:"id"`
	Url 		string	`json:"url"`
	Title 		string	`json:"title"`
	Auto_search bool	`json:"auto_search"`
	Search_perc int		`json:"search_perc"`
	Ru 			bool	`json:"ru"`
	Rf 			bool	`json:"rf"`
	Picture 	string	`json:"picture"`
}

type Clone struct {
	Id 			int64 	`json:"id"`
	Url 		string 	`json:"url"`
	Title 		string  `json:"title"`
	Picture 	string 	`json:"picture"`
	Reason 		string 	`json:"reason"`
}

func New(user string, password string, ip string, port int) Database {

	url := "postgres://" + user + ":" + password + "@" + ip + ":" + strconv.Itoa(port) + "/fishhunter?pool_max_conns=10"

	poolConfig, err := pgxpool.ParseConfig(url)
	if err != nil {
		log.Printf("Error parsing connection URL: %v", err)
	}
	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)

	create_all_dbs(pool)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	// defer conn.Close(context.Background())
	db := Database{user, password, ip, port, url, pool}

	return db

}

func (db Database) DeleteClone(clone_id int64) error {
	_, err := db.pool.Exec(context.Background(), `DELETE FROM clone WHERE clone_id = $1`, clone_id)
	return err
}

func (db Database) GetSiteClones(url string) ([]Clone, error){
	var site_id int64
	err := db.pool.QueryRow(context.Background(), `SELECT site_id from site where url=$1`, url).Scan(&site_id)
	if err != nil {
		log.Fatalf("Error scanning site_id: %v\n", err)
		// Можно вернуть ошибку или выполнить другие действия по необходимости
	}
	rows, err := db.pool.Query(context.Background(), `SELECT c.clone_id, c.url, c.title, p."content", c.reason FROM clone c join picture p on c.picture_id=p.picture_id where site_id=$1`, site_id)
	if err != nil {
		log.Printf("Error get clones: %v\n", err)
	}
	defer rows.Close()
	var clones []Clone
	for rows.Next() {
		var clone Clone
		var rawData []byte
		// fmt.Println(rows)
		err := rows.Scan(&clone.Id, &clone.Url, &clone.Title, &rawData, &clone.Reason)
		if err != nil {
			log.Printf("Error scanning row: %v\n", err)
			return nil, err
		}
		clone.Picture = base64.StdEncoding.EncodeToString(rawData)

		clones = append(clones, clone)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error reading rows: %v\n", err)
		return nil, err
	}

	return clones, nil
}

func (db Database) DeleteUnit(user_id int64, unit_id int64) error {
	_, err := db.pool.Exec(context.Background(), `DELETE FROM unit WHERE unit_id = $1 and user_id = $2`, unit_id, user_id)
	return err
}

func (db Database) GetUserUnits(user_id int64) ([]Unit, error) {
	var units []Unit
	rows, err := db.pool.Query(context.Background(), `
		SELECT u.unit_id, s.title, s.url, u.auto_search, u.search_perc, u.ru, u.rf, p."content" 
		FROM unit u JOIN site s ON u.site_id = s.site_id 
		join picture p on s.picture_id = p.picture_id 
		where u.user_id = $1;
	`, user_id)
	if err != nil {
		log.Printf("Error executing query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var unit Unit
		var rawData []byte
		// fmt.Println(rows)
		err := rows.Scan(&unit.Id, &unit.Title, &unit.Url, &unit.Auto_search, &unit.Search_perc, &unit.Ru, &unit.Rf, &rawData)
		if err != nil {
			log.Printf("Error scanning row: %v\n", err)
			return nil, err
		}
		unit.Picture = base64.StdEncoding.EncodeToString(rawData)

		units = append(units, unit)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error reading rows: %v\n", err)
		return nil, err
	}
	return units, nil

}

func (db Database) GetUserName(user_id int64) (string, error) {
	var user_name string
	err := db.pool.QueryRow(context.Background(), `SELECT name FROM "user" where user_id = $1`, user_id).Scan(&user_name)
	if err != nil {
		return "", err
	}
	return user_name, nil
}

func (db Database) GetUserId(login string, password string) (int64, error) {
	var user_id int64
	err := db.pool.QueryRow(context.Background(), `SELECT user_id FROM "user" where email = $1 and password = $2`, login, password).Scan(&user_id)
	if err != nil {
		return 0, err
	}
	return user_id, nil
}

func (db Database) AddNewUser(email string, name string, password string) error {
	err := db.insertUser(email, name, password)
	fmt.Println(err)
	return err
}

func (db Database) AddNewUnit(user_id int64, auto_search bool, ru bool, rf bool, picture string, title string, url string) int64 {
	picture_id, _ := db.insertPicture(picture)
	site_id, _ := db.insertSite(title, url, picture_id)
	unit_id := db.insertUnit(user_id, site_id, auto_search, 0, ru, rf)
	return unit_id
}

func (db Database) AddNewClone(url string, aim_url string, title string, picture string, reason string) {
	url = strings.TrimSpace(url)
	picture_id, _ := db.insertPicture(picture)
	var site_id int64
	err := db.pool.QueryRow(context.Background(), `SELECT site_id from site where url=$1`, aim_url).Scan(&site_id)
	if err != nil {
		log.Fatalf("Error scanning site_id: %v\n", err)
		// Можно вернуть ошибку или выполнить другие действия по необходимости
	}
	db.insertClone(url, site_id, picture_id, title, reason)
}

func (db Database) insertPicture(picture string) (int64, error) {
	var id int64
	err := db.pool.QueryRow(context.Background(), `INSERT INTO picture(content) VALUES(decode($1,'base64')) RETURNING picture_id`, picture).Scan(&id)
	if err != nil {
		log.Fatalf("Error executing insert picture: %v\n", err)
		return 0, err
	}
	return id, nil
}

func (db Database) insertUser(email string, name string, password string) error {
	_, err := db.pool.Exec(context.Background(), `INSERT INTO "user"(email, name, password) VALUES($1, $2, $3)`, email, name, password)
	if err != nil {
		fmt.Println(1)
		// log.Fatalf("Error executing insert user: %v\n", err)
		err = errors.New("Пользователь уже существует")
	}
	return err
}

func (db Database) insertSite(title string, url string, picture_id int64) (int64, error) {
	var id int64
	err := db.pool.QueryRow(context.Background(), `INSERT INTO site(title, url, picture_id) VALUES($1, $2, $3) RETURNING site_id`, title, url, picture_id).Scan(&id)
	if err != nil {
		log.Fatalf("Error executing insert site: %v\n", err)
		return 0, err
	}
	return id, nil
}

func (db Database) insertUnit(user_id int64, site_id int64, auto_search bool, search_perc int, ru bool, rf bool) (int64) {
	var unit_id int64
	err := db.pool.QueryRow(context.Background(), `INSERT INTO unit(user_id, site_id, auto_search, search_perc, ru, rf) VALUES($1, $2, $3, $4, $5, $6) RETURNING unit_id`, user_id, site_id, auto_search, search_perc, ru, rf).Scan(&unit_id)
	if err != nil {
		log.Fatalf("Error executing insert unit: %v\n", err)
	}
	return unit_id
	
}

func (db Database) insertClone(url string, site_id int64, picture_id int64, title string, reason string) {
	_, err := db.pool.Exec(context.Background(), `INSERT INTO clone(url, site_id, picture_id, title, reason) VALUES($1, $2, $3, $4, $5)`, url, site_id, picture_id, title, reason)
	if err != nil {
		fmt.Println(1)
		log.Fatalf("Error executing insert user: %v\n", err)
	}
}

func create_all_dbs(pool *pgxpool.Pool) {
	_, err := pool.Exec(context.Background(), `create table IF NOT EXISTS "user" (
		user_id serial PRIMARY KEY, 
		email VARCHAR (50) UNIQUE NOT NULL, 
		name VARCHAR (50) NOT NULL, 
		password VARCHAR (50) NOT NULL
	)`)
	if err != nil {
		log.Fatalf("Error creating db user: %v\n", err)
	}

	_, err = pool.Exec(context.Background(), `create table IF NOT EXISTS picture (
		picture_id serial PRIMARY KEY, 
		content bytea NOT NULL
	)`)
	if err != nil {
		log.Fatalf("Error creating db picture: %v\n", err)
	}

	_, err = pool.Exec(context.Background(), `create table IF NOT EXISTS site (
		site_id serial PRIMARY KEY, 
		title VARCHAR (150) NOT NULL, 
		url VARCHAR (256) NOT NULL,
		picture_id INTEGER REFERENCES picture (picture_id)
	)`)
	if err != nil {
		log.Fatalf("Error creating db site: %v\n", err)
	}

	_, err = pool.Exec(context.Background(), `create table IF NOT EXISTS unit (
		unit_id serial PRIMARY KEY,
		user_id INTEGER REFERENCES "user" (user_id),
		site_id INTEGER REFERENCES site (site_id),
		auto_search bool NOT NULL,
		search_perc int NOT NULL,
		ru bool NOT NULL,
		rf bool NOT NULL
	)`)
	if err != nil {
		log.Fatalf("Error creating db unit: %v\n", err)
	}

	_, err = pool.Exec(context.Background(), `create table IF NOT EXISTS clone (
		clone_id serial PRIMARY KEY,
		url VARCHAR (150) NOT NULL,
		site_id INTEGER REFERENCES site (site_id),
		picture_id INTEGER REFERENCES picture (picture_id),
		title VARCHAR (150) NOT NULL,
		reason VARCHAR (150) NOT NULL
	)`)

	if err != nil {
		log.Fatalf("Error creating db clone: %v\n", err)
	}
}
/*
func (db database) SelectPicture(request string) string {
	var rawData []byte
	err := db.conn.QueryRow(context.Background(), request).Scan(&rawData)
	if err != nil {
		log.Fatalf("Error executing query: %v\n", err)
	}
	image := base64.StdEncoding.EncodeToString(rawData)
	return image
}
*/


func main() {
	// urlExample := "postgres://postgres:postgres@localhost:5432/fishhunter"
	// conn, err := pgx.Connect(context.Background(), urlExample)
	// if err != nil {
	// 	fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
	// 	os.Exit(1)
	// }
	// defer conn.Close(context.Background())

	// rows, err := conn.Query(context.Background(), "SELECT * FROM test")
	// if err != nil {
	// 	log.Fatalf("Error executing query: %v\n", err)
	// }
	// defer rows.Close()

	// for rows.Next() {
	// 	var rawData []byte
	// 	// var image string

	// 	err := rows.Scan(&rawData)
	// 	if err != nil {
	// 		log.Fatalf("Error scanning row: %v\n", err)
	// 	}

	// 	image := base64.StdEncoding.EncodeToString(rawData)
	// 	fmt.Printf(image)
	// }

	// if err := rows.Err(); err != nil {
	// 	log.Fatalf("Error reading rows: %v\n", err)
	// }
	// myVar := ""
	// _, err = conn.Exec(context.Background(), "INSERT INTO test(image) VALUES(decode('" + myVar + "','base64'))")
	// if err != nil {
	// 	log.Fatalf("Error executing insert query: %v\n", err)
	// }

}

func insert() {

}
