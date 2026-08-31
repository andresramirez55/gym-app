package handler

import (
	"net/http"
	"strconv"

	"github.com/andresramirez/gym-app/internal/service"
)

type SuggestionHandler struct {
	suggestionService service.SuggestionService
}

func NewSuggestionHandler(suggestionService service.SuggestionService) *SuggestionHandler {
	return &SuggestionHandler{suggestionService: suggestionService}
}

func (h *SuggestionHandler) GetPending(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	suggestion, err := h.suggestionService.GetPending(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusNotFound, "No pending suggestion")
		return
	}

	respondJSON(w, http.StatusOK, suggestion)
}

func (h *SuggestionHandler) Apply(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid suggestion ID")
		return
	}

	routine, err := h.suggestionService.Apply(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"message":    "suggestion applied",
		"routine_id": routine.ID,
	})
}

func (h *SuggestionHandler) Dismiss(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid suggestion ID")
		return
	}

	if err := h.suggestionService.Dismiss(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "suggestion dismissed"})
}
