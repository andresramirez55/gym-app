package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/andresramirez/gym-app/internal/domain"
)

type AIService interface {
	GenerateRoutine(ctx context.Context, goal domain.FitnessGoal, frequency domain.Frequency) (*AIGeneratedRoutine, error)
}

type aiService struct {
	apiKey     string
	httpClient *http.Client
}

type AIGeneratedRoutine struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Days        []AIRoutineDay `json:"days"`
}

type AIRoutineDay struct {
	DayNumber int           `json:"day_number"`
	DayName   string        `json:"day_name"`
	Exercises []AIExercise  `json:"exercises"`
}

type AIExercise struct {
	Name        string `json:"name"`
	Sets        int    `json:"sets"`
	Reps        string `json:"reps"`
	RestSeconds int    `json:"rest_seconds"`
	Notes       string `json:"notes"`
}

func NewAIService(apiKey string) AIService {
	return &aiService{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

func (s *aiService) GenerateRoutine(ctx context.Context, goal domain.FitnessGoal, frequency domain.Frequency) (*AIGeneratedRoutine, error) {
	prompt := s.buildPrompt(goal, frequency)

	requestBody := map[string]interface{}{
		"model": "claude-sonnet-4-5-20250929",
		"max_tokens": 4096,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error calling API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var apiResponse struct {
		Content []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"content"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	if len(apiResponse.Content) == 0 {
		return nil, fmt.Errorf("empty response from API")
	}

	var routine AIGeneratedRoutine
	if err := json.Unmarshal([]byte(apiResponse.Content[0].Text), &routine); err != nil {
		return nil, fmt.Errorf("error parsing AI response: %w", err)
	}

	return &routine, nil
}

func (s *aiService) buildPrompt(goal domain.FitnessGoal, frequency domain.Frequency) string {
	goalDesc := map[domain.FitnessGoal]string{
		domain.GainMuscle:    "ganar masa muscular (hipertrofia)",
		domain.LoseWeight:    "perder peso y tonificar",
		domain.BuildStrength: "ganar fuerza máxima",
		domain.Endurance:     "mejorar resistencia muscular",
		domain.General:       "fitness general y salud",
	}

	return fmt.Sprintf(`Eres un entrenador personal experto. Genera una rutina de gimnasio para alguien cuyo objetivo es: %s.

La rutina debe ser para %d días a la semana.

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura exacta:

{
  "name": "Nombre de la rutina",
  "description": "Breve descripción de la rutina (1-2 líneas)",
  "days": [
    {
      "day_number": 1,
      "day_name": "Nombre del día (ej: Pecho y Tríceps)",
      "exercises": [
        {
          "name": "Nombre del ejercicio",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 90,
          "notes": "Consejos o variantes opcionales"
        }
      ]
    }
  ]
}

Requisitos:
- Incluye entre 4-6 ejercicios por día
- Usa ejercicios efectivos y seguros
- Varía los rangos de repeticiones según el objetivo
- Incluye ejercicios compuestos y accesorios
- Los tiempos de descanso deben ser apropiados (60-180 segundos)
- Los nombres deben estar en español`, goalDesc[goal], frequency)
}
