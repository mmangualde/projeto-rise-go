package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"database/sql"
	"fmt"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "Mo@200802" // setar variavel de ambiente para guardar senha
	dbname   = "code-drop"
  )
  
  func main_databaseconn() {
	connStr := fmt.Sprintf("host=%s port=%d user=%s "+
	  "password=%s dbname=%s sslmode=disable",
	  host, port, user, password, dbname)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
	  panic(err)
	}
	defer db.Close()
  
	err = db.Ping()
	if err != nil {
	  panic(err)
	}
  
	fmt.Println("Successfully connected!")
  }

//   func Cadastro(){
	
//   }

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

	mutex.Lock()
	codeStorage[id] = entry.Code
	mutex.Unlock()

	response := map[string]string{"link": "http://localhost:5173/view/" + id}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getCodeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	mutex.Lock()
	code, exists := codeStorage[id]
	mutex.Unlock()

	if !exists {
		http.Error(w, "Código não encontrado", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(CodeEntry{Code: code})
}

func main() {
	main_databaseconn()
	router := mux.NewRouter()

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	router.Use(corsHandler.Handler)

	router.HandleFunc("/api/submit", saveCodeHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/view/{id}", getCodeHandler).Methods("GET")

	log.Println("Servidor rodando em http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}