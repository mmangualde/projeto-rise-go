package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"database/sql"
	"fmt"
	"time"
	"crypto/rand"
	"encoding/base64"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
)

var db *sql.DB

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "Mo@200802" // setar variavel de ambiente para guardar senha
	dbname   = "code-drop"
  )
  
  func main_databaseconn() {
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", connStr) 
	if err != nil {
		log.Fatal("Erro ao conectar ao banco:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao verificar conexão com o banco:", err)
	}

	fmt.Println("Conectado ao banco de dados!")
}

type User struct{
	Name  string `json:"nome"`
	Email string `json:"email"`
	Senha string `json:"senha"`
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func registerUser(w http.ResponseWriter, r *http.Request) {
    var user User
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        http.Error(w, "Erro ao processar JSON", http.StatusBadRequest)
        return
    }

    hashedPassword, err := hashPassword(user.Senha)
    if err != nil {
        http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
        return
    }

    _, err = db.Exec(`INSERT INTO "Users" (name, password, email) VALUES ($1, $2, $3)`, user.Name, hashedPassword, user.Email)
    if err != nil {
		log.Println("Erro ao cadastrar usuário:", err)
        http.Error(w, "Erro ao cadastrar usuário: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"message": "Usuário cadastrado com sucesso!"})
}

var jwtSecret []byte

func generateSecretKey() string {
	if jwtSecret == nil {
		key := make([]byte, 32)
		_, err := rand.Read(key)
		if err != nil {
			panic("Erro ao gerar chave secreta")
		}
		jwtSecret = key 
	}

	return base64.StdEncoding.EncodeToString(jwtSecret)
}

var (
	tokenStorage = make(map[int]string) 
	tokenMutex   = sync.Mutex{}        
)

type Claims struct {
	Email string `json:"email"`
	UserID int `json:"user_id"`
	jwt.StandardClaims
}

func loginUser(w http.ResponseWriter, r *http.Request) {
	generateSecretKey()
	var user User
	var storedPassword string
	var user_ID int

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Erro ao processar JSON", http.StatusBadRequest)
		return
	}

	err = db.QueryRow(`SELECT user_id, password FROM "Users" WHERE email = $1`, user.Email).Scan(&user_ID, &storedPassword)
	if err != nil {
		http.Error(w, "Usuário não encontrado", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Senha))
	if err != nil {
		http.Error(w, "Senha incorreta", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Email:  user.Email,
		UserID: user_ID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Erro ao gerar token", http.StatusInternalServerError)
		return
	}

	tokenMutex.Lock()
	tokenStorage[user_ID] = tokenString
	tokenMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

type CodeEntry struct {
	Code string `json:"code"`
}

var (
	codeStorage = make(map[string]string)
	mutex       = sync.Mutex{}
)

func generateID() string {
	return uuid.New().String()
}

func isTokenValid(userID int, token string) bool {
	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	storedToken, exists := tokenStorage[userID]
	return exists && storedToken == token
}

func extractUserID(r *http.Request) (int, error) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return 0, fmt.Errorf("token não encontrado")
	}

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return 0, fmt.Errorf("token inválido")
	}

	userID := claims.UserID

	if !isTokenValid(claims.UserID, tokenString) {
		return 0, fmt.Errorf("token expirado ou inválido")
	}

	return userID, nil
}


func saveCodeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var entry CodeEntry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		http.Error(w, "Erro ao decodificar JSON", http.StatusBadRequest)
		return
	}

	id := generateID()
	link := "http://localhost:5173/view/" + id

	userID, err := extractUserID(r)

	if err != nil {
		mutex.Lock()
		codeStorage[id] = entry.Code
		mutex.Unlock()
	} else {
		_, err = db.Exec("INSERT INTO links (url, user_id, code) VALUES ($1, $2, $3)", link, userID, entry.Code)
		if err != nil {
			http.Error(w, "Erro ao salvar código no banco", http.StatusInternalServerError)
			return
		}
	}

	response := map[string]string{"link": link}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getCodeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	link := "http://localhost:5173/view/" + id

	var code string
	err := db.QueryRow("SELECT code FROM links WHERE url = $1", link).Scan(&code)
	if err == sql.ErrNoRows {
		mutex.Lock()
		memCode, exists := codeStorage[id]
		mutex.Unlock()

		if !exists {
			http.Error(w, "Código não encontrado", http.StatusNotFound)
			return
		}
		code = memCode
	} else if err != nil {
		http.Error(w, "Erro ao buscar código", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(CodeEntry{Code: code})
}

type linkEntry struct{
	Link string `json:"url"`
}

func getUserLinks(w http.ResponseWriter, r *http.Request) {
	userID, err := extractUserID(r)
	if err != nil {
		http.Error(w, "Erro ao buscar id do usuário", http.StatusBadRequest)
		return
	}

	rows, err := db.Query("SELECT url FROM links WHERE user_id = $1", userID)
	if err != nil {
		http.Error(w, "Erro ao buscar links do usuário", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var links []linkEntry

	for rows.Next() {
		var link linkEntry
		if err := rows.Scan(&link.Link); err != nil {
			http.Error(w, "Erro ao processar link", http.StatusInternalServerError)
			return
		}
		links = append(links, link)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"links": links,
	})
}

func main() {
	main_databaseconn()
	defer db.Close()
	router := mux.NewRouter()

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		Debug:            true,
	})

	router.Use(corsHandler.Handler)

	router.HandleFunc("/api/submit", saveCodeHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/view/{id}", getCodeHandler).Methods("GET")
	router.HandleFunc("/api/register", registerUser).Methods("POST")
	router.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")
	router.HandleFunc("/api/login", loginUser).Methods("POST")
	router.HandleFunc("/api/user/links", getUserLinks).Methods("GET")

	log.Println("Servidor rodando em http://localhost:8080")
	handler := corsHandler.Handler(router)
	log.Fatal(http.ListenAndServe(":8080", handler))
}