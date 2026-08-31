package repository

import (
	"context"
	"database/sql"

	"github.com/andresramirez/gym-app/internal/domain"
)

type RoutineSuggestionRepository interface {
	// CreateAwaitingInput guarda el prompt recién generado, sin diagnóstico ni
	// rutina todavía (el usuario lo pega a mano después de consultar a Claude).
	CreateAwaitingInput(ctx context.Context, s *domain.RoutineSuggestion) error
	// SubmitAnswer completa una sugerencia awaiting_input con lo que el usuario
	// pegó de vuelta, y la pasa a estado pending (lista para revisar/aplicar).
	SubmitAnswer(ctx context.Context, id int64, diagnosis, suggestedRoutineJSON string) error
	GetLatestByUserID(ctx context.Context, userID int64) (*domain.RoutineSuggestion, error)
	GetByID(ctx context.Context, id int64) (*domain.RoutineSuggestion, error)
	UpdateStatus(ctx context.Context, id int64, status domain.SuggestionStatus) error
	ExistsForRoutine(ctx context.Context, routineID int64) (bool, error)
}

type routineSuggestionRepository struct {
	db *sql.DB
}

func NewRoutineSuggestionRepository(db *sql.DB) RoutineSuggestionRepository {
	return &routineSuggestionRepository{db: db}
}

func (r *routineSuggestionRepository) CreateAwaitingInput(ctx context.Context, s *domain.RoutineSuggestion) error {
	query := `
		INSERT INTO routine_suggestions (user_id, routine_id, prompt, diagnosis, suggested_routine, status, created_at)
		VALUES ($1, $2, $3, '', '{}', $4, NOW())
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query,
		s.UserID, s.RoutineID, s.Prompt, domain.SuggestionAwaitingInput,
	).Scan(&s.ID, &s.CreatedAt)
}

func (r *routineSuggestionRepository) SubmitAnswer(ctx context.Context, id int64, diagnosis, suggestedRoutineJSON string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE routine_suggestions
		SET diagnosis = $1, suggested_routine = $2, status = $3
		WHERE id = $4
	`, diagnosis, suggestedRoutineJSON, domain.SuggestionPending, id)
	return err
}

// GetLatestByUserID trae la sugerencia más reciente en un estado "activo"
// (awaiting_input o pending) - lo que la app debe mostrar en el banner/pantalla.
func (r *routineSuggestionRepository) GetLatestByUserID(ctx context.Context, userID int64) (*domain.RoutineSuggestion, error) {
	s := &domain.RoutineSuggestion{}
	query := `
		SELECT id, user_id, routine_id, prompt, diagnosis, suggested_routine, status, created_at
		FROM routine_suggestions
		WHERE user_id = $1 AND status IN ('awaiting_input', 'pending')
		ORDER BY created_at DESC
		LIMIT 1
	`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&s.ID, &s.UserID, &s.RoutineID, &s.Prompt, &s.Diagnosis, &s.SuggestedRoutine, &s.Status, &s.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *routineSuggestionRepository) GetByID(ctx context.Context, id int64) (*domain.RoutineSuggestion, error) {
	s := &domain.RoutineSuggestion{}
	query := `
		SELECT id, user_id, routine_id, prompt, diagnosis, suggested_routine, status, created_at
		FROM routine_suggestions
		WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ID, &s.UserID, &s.RoutineID, &s.Prompt, &s.Diagnosis, &s.SuggestedRoutine, &s.Status, &s.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *routineSuggestionRepository) UpdateStatus(ctx context.Context, id int64, status domain.SuggestionStatus) error {
	_, err := r.db.ExecContext(ctx, `UPDATE routine_suggestions SET status = $1 WHERE id = $2`, status, id)
	return err
}

// ExistsForRoutine evita generar más de un prompt para el mismo ciclo
// (idempotencia: si el usuario loguea varios entrenamientos después de cruzar
// el umbral, no queremos regenerar el prompt de nuevo).
func (r *routineSuggestionRepository) ExistsForRoutine(ctx context.Context, routineID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM routine_suggestions WHERE routine_id = $1`, routineID).Scan(&count)
	return count > 0, err
}
