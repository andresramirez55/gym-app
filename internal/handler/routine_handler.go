package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/service"
)

type RoutineHandler struct {
	routineService service.RoutineService
}

func NewRoutineHandler(routineService service.RoutineService) *RoutineHandler {
	return &RoutineHandler{routineService: routineService}
}

func (h *RoutineHandler) GenerateRoutine(w http.ResponseWriter, r *http.Request) {
	var req dto.GenerateRoutineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	routine, err := h.routineService.GenerateRoutineForUser(r.Context(), &req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, h.toRoutineResponse(routine))
}

func (h *RoutineHandler) CreateRoutine(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateRoutineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	routine, err := h.routineService.CreateRoutine(r.Context(), &req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, h.toRoutineResponse(routine))
}

func (h *RoutineHandler) ImportRoutine(w http.ResponseWriter, r *http.Request) {
	var req dto.ImportRoutineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	routine, err := h.routineService.ImportRoutine(r.Context(), &req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, h.toRoutineResponse(routine))
}

func (h *RoutineHandler) GetRoutine(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid routine ID")
		return
	}

	routine, err := h.routineService.GetRoutineByID(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, h.toRoutineResponse(routine))
}

func (h *RoutineHandler) GetActiveRoutine(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	routine, err := h.routineService.GetActiveRoutineByUserID(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, h.toRoutineResponse(routine))
}

func (h *RoutineHandler) UpdateExercise(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	var req dto.UpdateExerciseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	exercise := &domain.Exercise{
		ID:          id,
		Name:        req.Name,
		Sets:        req.Sets,
		Reps:        req.Reps,
		RestSeconds: req.RestSeconds,
		Notes:       req.Notes,
	}

	if err := h.routineService.UpdateExercise(r.Context(), exercise); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Exercise updated successfully"})
}

func (h *RoutineHandler) toRoutineResponse(routine *domain.Routine) *dto.RoutineResponse {
	days := make([]dto.RoutineDayDTO, len(routine.Days))
	for i, day := range routine.Days {
		exercises := make([]dto.ExerciseDTO, len(day.Exercises))
		for j, ex := range day.Exercises {
			exercises[j] = dto.ExerciseDTO{
				ID:          ex.ID,
				Name:        ex.Name,
				Sets:        ex.Sets,
				Reps:        ex.Reps,
				RestSeconds: ex.RestSeconds,
				Order:       ex.Order,
				Notes:       ex.Notes,
			}
		}

		days[i] = dto.RoutineDayDTO{
			ID:        day.ID,
			DayNumber: day.DayNumber,
			DayName:   day.DayName,
			Exercises: exercises,
		}
	}

	return &dto.RoutineResponse{
		ID:            routine.ID,
		UserID:        routine.UserID,
		Name:          routine.Name,
		Description:   routine.Description,
		Goal:          routine.Goal,
		Frequency:     routine.Frequency,
		IsActive:      routine.IsActive,
		DurationWeeks: routine.DurationWeeks,
		WeekNumber:    routine.WeekNumber,
		DaysRemaining: routine.DaysRemaining,
		Days:          days,
		CreatedAt:     routine.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}
