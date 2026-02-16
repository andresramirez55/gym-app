package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/andresramirez/gym-app/internal/config"
	"github.com/andresramirez/gym-app/internal/handler"
	"github.com/andresramirez/gym-app/internal/repository"
	"github.com/andresramirez/gym-app/internal/service"
	"github.com/andresramirez/gym-app/pkg/database"
	"github.com/rs/cors"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	db, err := database.Connect(cfg.Database.ConnectionString())
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	routineRepo := repository.NewRoutineRepository(db)
	routineTemplateRepo := repository.NewRoutineTemplateRepository(db)
	workoutRepo := repository.NewWorkoutRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	routineService := service.NewRoutineServiceWithTemplates(routineRepo, routineTemplateRepo)
	workoutService := service.NewWorkoutService(workoutRepo, routineRepo)

	// Initialize handlers
	userHandler := handler.NewUserHandler(userService)
	routineHandler := handler.NewRoutineHandler(routineService)
	workoutHandler := handler.NewWorkoutHandler(workoutService)

	// Setup routes
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// User routes
	mux.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			userHandler.CreateUser(w, r)
		case http.MethodGet:
			userHandler.GetUser(w, r)
		case http.MethodPut:
			userHandler.UpdateUser(w, r)
		case http.MethodDelete:
			userHandler.DeleteUser(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Routine routes
	mux.HandleFunc("/api/routines/generate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			routineHandler.GenerateRoutine(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/routines", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			routineHandler.GetRoutine(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/routines/active", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			routineHandler.GetActiveRoutine(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Workout routes
	mux.HandleFunc("/api/workouts/log", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			workoutHandler.LogWorkout(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/workouts/history", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			workoutHandler.GetWorkoutHistory(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/workouts/progress", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			workoutHandler.GetWeightProgress(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Setup CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // In production, specify your mobile app's origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, corsHandler.Handler(mux)); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
