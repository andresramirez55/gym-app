package domain

import "time"

type SuggestionStatus string

const (
	SuggestionPending   SuggestionStatus = "pending"
	SuggestionApplied   SuggestionStatus = "applied"
	SuggestionDismissed SuggestionStatus = "dismissed"
)

// RoutineSuggestion es la propuesta de Claude generada al completar un ciclo.
// SuggestedRoutine guarda el JSON crudo de dto.CreateRoutineRequest listo para aplicar.
type RoutineSuggestion struct {
	ID               int64            `json:"id" db:"id"`
	UserID           int64            `json:"user_id" db:"user_id"`
	RoutineID        int64            `json:"routine_id" db:"routine_id"`
	Diagnosis        string           `json:"diagnosis" db:"diagnosis"`
	SuggestedRoutine string           `json:"-" db:"suggested_routine"`
	Status           SuggestionStatus `json:"status" db:"status"`
	CreatedAt        time.Time        `json:"created_at" db:"created_at"`
}
