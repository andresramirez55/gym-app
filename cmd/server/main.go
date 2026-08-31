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

	// Auto-apply lightweight additive migrations (idempotent, safe to run on every boot).
	// Ver migrations/008_add_rir.sql y 009_routine_suggestions.sql - se mantienen ahí como referencia.
	if _, err := db.Exec(`ALTER TABLE set_logs ADD COLUMN IF NOT EXISTS rir SMALLINT`); err != nil {
		log.Fatal("Failed to run RIR migration:", err)
	}
	if _, err := db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT`); err != nil {
		log.Fatal("Failed to run push_token migration:", err)
	}
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS routine_suggestions (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			routine_id BIGINT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
			diagnosis TEXT NOT NULL,
			suggested_routine JSONB NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)
	`); err != nil {
		log.Fatal("Failed to run routine_suggestions migration:", err)
	}
	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_routine_suggestions_user_id ON routine_suggestions(user_id)`); err != nil {
		log.Fatal("Failed to create routine_suggestions index:", err)
	}
	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_routine_suggestions_status ON routine_suggestions(status)`); err != nil {
		log.Fatal("Failed to create routine_suggestions status index:", err)
	}
	if _, err := db.Exec(`ALTER TABLE routine_suggestions ADD COLUMN IF NOT EXISTS prompt TEXT NOT NULL DEFAULT ''`); err != nil {
		log.Fatal("Failed to run suggestion prompt migration:", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	routineRepo := repository.NewRoutineRepository(db)
	routineTemplateRepo := repository.NewRoutineTemplateRepository(db)
	workoutRepo := repository.NewWorkoutRepository(db)
	suggestionRepo := repository.NewRoutineSuggestionRepository(db)

	// Initialize services
	userService := service.NewUserService(userRepo)
	pushService := service.NewPushService()

	// Initialize AI service (optional - only if CLAUDE_API_KEY is set)
	var aiService service.AIService
	if cfg.ClaudeAPI.APIKey != "" {
		aiService = service.NewAIService(cfg.ClaudeAPI.APIKey)
		log.Println("AI service initialized - routine import feature available")
	} else {
		log.Println("CLAUDE_API_KEY not set - routine import feature will not be available")
	}

	routineService := service.NewRoutineServiceWithTemplates(routineRepo, routineTemplateRepo, workoutRepo, aiService)

	// El flujo de sugerencias es manual (arma el prompt, no llama a ninguna API),
	// así que no depende de CLAUDE_API_KEY - siempre está disponible.
	suggestionService := service.NewSuggestionService(suggestionRepo, routineRepo, workoutRepo, userRepo, pushService, routineService)

	workoutService := service.NewWorkoutService(workoutRepo, routineRepo, suggestionService)

	// Initialize handlers
	userHandler := handler.NewUserHandler(userService)
	routineHandler := handler.NewRoutineHandler(routineService)
	workoutHandler := handler.NewWorkoutHandler(workoutService)
	suggestionHandler := handler.NewSuggestionHandler(suggestionService)

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

	mux.HandleFunc("/api/routines/import", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			routineHandler.ImportRoutine(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/routines", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			routineHandler.GetRoutine(w, r)
		case http.MethodPost:
			routineHandler.CreateRoutine(w, r)
		default:
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

	// Routine suggestion routes (sugerencia manual al completar un ciclo: se
	// arma el prompt para copiar/pegar en Claude, no llama a ninguna API paga)
	mux.HandleFunc("/api/routines/suggestions", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			suggestionHandler.GetCurrent(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/routines/suggestions/submit", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			suggestionHandler.SubmitAnswer(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/routines/suggestions/apply", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			suggestionHandler.Apply(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/routines/suggestions/dismiss", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			suggestionHandler.Dismiss(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/users/push-token", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPut {
			userHandler.RegisterPushToken(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Exercise routes
	mux.HandleFunc("/api/exercises", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPut {
			routineHandler.UpdateExercise(w, r)
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
		switch r.Method {
		case http.MethodGet:
			workoutHandler.GetWorkoutHistory(w, r)
		case http.MethodDelete:
			workoutHandler.DeleteWorkout(w, r)
		default:
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
