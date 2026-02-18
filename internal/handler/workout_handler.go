package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/service"
)

type WorkoutHandler struct {
	workoutService service.WorkoutService
}

func NewWorkoutHandler(workoutService service.WorkoutService) *WorkoutHandler {
	return &WorkoutHandler{workoutService: workoutService}
}

func (h *WorkoutHandler) LogWorkout(w http.ResponseWriter, r *http.Request) {
	var req dto.LogWorkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	log, err := h.workoutService.LogWorkout(r.Context(), &req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, &dto.WorkoutLogResponse{
		ID:          log.ID,
		CompletedAt: log.CompletedAt.Format("2006-01-02 15:04:05"),
		Duration:    log.Duration,
	})
}

func (h *WorkoutHandler) GetWorkoutHistory(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	limit := 10 // default
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	logs, err := h.workoutService.GetWorkoutHistory(r.Context(), userID, limit)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	responses := make([]dto.WorkoutLogResponse, len(logs))
	for i, log := range logs {
		exLogs := make([]dto.ExerciseLogDetail, len(log.ExerciseLogs))
		for j, exLog := range log.ExerciseLogs {
			sets := make([]dto.SetLogDTO, len(exLog.Sets))
			for k, set := range exLog.Sets {
				sets[k] = dto.SetLogDTO{
					SetNumber: set.SetNumber,
					Weight:    set.Weight,
					Reps:      set.Reps,
				}
			}

			exLogs[j] = dto.ExerciseLogDetail{
				ExerciseName: exLog.ExerciseName,
				Sets:         sets,
			}
		}

		responses[i] = dto.WorkoutLogResponse{
			ID:           log.ID,
			RoutineDayID: log.RoutineDayID,
			CompletedAt:  log.CompletedAt.Format("2006-01-02 15:04:05"),
			Duration:     log.Duration,
			ExerciseLogs: exLogs,
		}
	}

	respondJSON(w, http.StatusOK, responses)
}

func (h *WorkoutHandler) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		// Delete all
		if err := h.workoutService.DeleteAllWorkoutLogs(r.Context(), userID); err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		respondJSON(w, http.StatusOK, map[string]string{"message": "all workouts deleted"})
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid workout ID")
		return
	}
	if err := h.workoutService.DeleteWorkoutLog(r.Context(), id, userID); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "workout deleted"})
}

func (h *WorkoutHandler) GetWeightProgress(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	exerciseIDStr := r.URL.Query().Get("exercise_id")
	exerciseID, err := strconv.ParseInt(exerciseIDStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	progress, err := h.workoutService.GetWeightProgress(r.Context(), userID, exerciseID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, progress)
}
