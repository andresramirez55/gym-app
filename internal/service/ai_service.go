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
	ParseRoutineText(ctx context.Context, text string) (*AIGeneratedRoutine, error)
	AnalyzeRoutineCompletion(ctx context.Context, routine *domain.Routine, logs []domain.WorkoutLog) (*AIRoutineSuggestion, error)
}

// AIRoutineSuggestion es la respuesta de Claude al cerrar un ciclo: diagnóstico
// del bloque que terminó + la propuesta de la próxima rutina.
type AIRoutineSuggestion struct {
	Diagnosis     string         `json:"diagnosis"`
	Name          string         `json:"name"`
	DurationWeeks int            `json:"duration_weeks"`
	Days          []AIRoutineDay `json:"days"`
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
	DayNumber int          `json:"day_number"`
	DayName   string       `json:"day_name"`
	Exercises []AIExercise `json:"exercises"`
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
		"model":      "claude-sonnet-5",
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

func (s *aiService) ParseRoutineText(ctx context.Context, text string) (*AIGeneratedRoutine, error) {
	prompt := s.buildParsePrompt(text)

	requestBody := map[string]interface{}{
		"model":      "claude-sonnet-5",
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

func (s *aiService) AnalyzeRoutineCompletion(ctx context.Context, routine *domain.Routine, logs []domain.WorkoutLog) (*AIRoutineSuggestion, error) {
	prompt, err := BuildRoutineAnalysisPrompt(routine, logs)
	if err != nil {
		return nil, fmt.Errorf("error building analysis prompt: %w", err)
	}

	requestBody := map[string]interface{}{
		"model":      "claude-sonnet-5",
		"max_tokens": 8192,
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

	var suggestion AIRoutineSuggestion
	if err := json.Unmarshal([]byte(apiResponse.Content[0].Text), &suggestion); err != nil {
		return nil, fmt.Errorf("error parsing AI response: %w", err)
	}

	return &suggestion, nil
}

// BuildRoutineAnalysisPrompt arma el prompt de diagnóstico + próxima rutina a
// partir de datos reales. No depende de ninguna API key ni hace llamadas de
// red - es texto puro, pensado para copiarlo y pegarlo directamente en Claude
// (o para usarlo con AIService.AnalyzeRoutineCompletion si se prefiere que el
// backend consulte la API automáticamente).
func BuildRoutineAnalysisPrompt(routine *domain.Routine, logs []domain.WorkoutLog) (string, error) {
	routineJSON, err := json.Marshal(routine)
	if err != nil {
		return "", err
	}
	logsJSON, err := json.Marshal(logs)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf(`Sos un entrenador personal experto revisando el ciclo de entrenamiento que un usuario acaba de completar.

RUTINA QUE ACABA DE TERMINAR (incluye días y ejercicios):
%s

HISTORIAL COMPLETO DE ENTRENAMIENTOS DE ESTE CICLO (pesos y reps reales, serie por serie):
%s

Analizá el progreso real: qué ejercicios subieron de peso de forma consistente, cuáles se estancaron (mismo peso/reps varias sesiones seguidas), y si hay señales de fatiga acumulada (retrocesos de peso al final del ciclo). Con eso, diseñá el próximo bloque de entrenamiento, igual que haría un entrenador que revisa los números antes de armar el siguiente ciclo: pesos de arranque basados en los datos reales (no genéricos), y ajustes puntuales donde el bloque anterior se estancó.

Si un ejercicio estuvo estancado varias semanas seguidas sin explicación de fatiga, no te limites a "subí el peso" - proponé un reemplazo concreto (otro ejercicio para el mismo grupo muscular) y explicá por qué lo cambiarías. Priorizá cambios puntuales y justificados por sobre reescribir toda la rutina de cero.

Esto es una conversación, no una respuesta única: si después de ver esta propuesta el usuario te pide ajustes (cambiar un ejercicio, el orden de los días, el volumen de algo puntual), respondé con el mismo JSON completo actualizado - es lo que va a pegar de vuelta en la app.

Devolvé ÚNICAMENTE un JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura exacta:

{
  "diagnosis": "2-4 oraciones: qué progresó bien, qué se estancó, y qué cambia en este bloque nuevo (si reemplazaste algún ejercicio, decí cuál y por qué)",
  "name": "Nombre de la rutina nueva",
  "duration_weeks": 12,
  "days": [
    {
      "day_number": 1,
      "day_name": "Nombre del día",
      "exercises": [
        {"name": "...", "sets": 4, "reps": "8-12", "rest_seconds": 90, "notes": "peso de arranque sugerido + regla de progresión, basado en los pesos reales del historial"}
      ]
    }
  ]
}

Mantené %d días de entrenamiento (la misma cantidad que la rutina actual) salvo que el estancamiento amerite un cambio de split. Los nombres deben estar en español.`, string(routineJSON), string(logsJSON), routine.Frequency), nil
}

func (s *aiService) buildParsePrompt(text string) string {
	return fmt.Sprintf(`Eres un entrenador personal experto. Analiza la siguiente rutina de gimnasio y extrae su información en formato estructurado.

RUTINA A ANALIZAR:
%s

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura exacta:

{
  "name": "Nombre de la rutina (extrae del texto o genera uno descriptivo)",
  "description": "Breve descripción basada en el contenido (1-2 líneas)",
  "days": [
    {
      "day_number": 1,
      "day_name": "Nombre del día extraído del texto",
      "exercises": [
        {
          "name": "Nombre del ejercicio",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 90,
          "notes": "Cualquier nota adicional del ejercicio"
        }
      ]
    }
  ]
}

INSTRUCCIONES:
- Si el texto usa formatos como "2x10 2x8 1x6", interpreta como series progresivas (ej: "2-6" sets, "6-10" reps)
- Si hay un descanso global (ej: "descanso 90 seg"), aplícalo a todos los ejercicios que no tengan uno específico
- Si no se especifica descanso, usa 60 segundos por defecto
- Si el texto tiene formato poco convencional, haz tu mejor interpretación basada en patrones comunes de entrenamiento
- Respeta el orden y agrupación de ejercicios por día
- Si no hay nombre de rutina explícito, genera uno descriptivo basado en el contenido`, text)
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
