package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/andresramirez/gym-app/internal/domain"
	"github.com/andresramirez/gym-app/internal/dto"
	"github.com/andresramirez/gym-app/internal/service"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.CreateUser(r.Context(), &req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, h.toUserResponse(user))
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	// Support lookup by email
	if email := r.URL.Query().Get("email"); email != "" {
		user, err := h.userService.GetUserByEmail(r.Context(), email)
		if err != nil {
			respondError(w, http.StatusNotFound, "User not found")
			return
		}
		respondJSON(w, http.StatusOK, h.toUserResponse(user))
		return
	}

	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userService.GetUserByID(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, h.toUserResponse(user))
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req dto.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.UpdateUser(r.Context(), id, &req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, h.toUserResponse(user))
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.DeleteUser(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "User deleted successfully"})
}

func (h *UserHandler) toUserResponse(user *domain.User) *dto.UserResponse {
	return &dto.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Goal:      user.Goal,
		Frequency: user.Frequency,
		CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}
