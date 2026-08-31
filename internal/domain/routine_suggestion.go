package domain

import "time"

type SuggestionStatus string

const (
	// AwaitingInput: se generó el prompt y se avisó por push, pero todavía no
	// se pegó la respuesta de Claude de vuelta en la app.
	SuggestionAwaitingInput SuggestionStatus = "awaiting_input"
	SuggestionPending       SuggestionStatus = "pending"
	SuggestionApplied       SuggestionStatus = "applied"
	SuggestionDismissed     SuggestionStatus = "dismissed"
)

// RoutineSuggestion representa el ciclo de vida de la sugerencia manual:
// se genera el Prompt (sin costo, sin llamar a ninguna API) al completar el
// ciclo, y Diagnosis/SuggestedRoutine quedan vacíos hasta que el usuario pega
// la respuesta que le pidió a Claude a mano.
type RoutineSuggestion struct {
	ID               int64            `json:"id" db:"id"`
	UserID           int64            `json:"user_id" db:"user_id"`
	RoutineID        int64            `json:"routine_id" db:"routine_id"`
	Prompt           string           `json:"-" db:"prompt"`
	Diagnosis        string           `json:"diagnosis" db:"diagnosis"`
	SuggestedRoutine string           `json:"-" db:"suggested_routine"`
	Status           SuggestionStatus `json:"status" db:"status"`
	CreatedAt        time.Time        `json:"created_at" db:"created_at"`
}
