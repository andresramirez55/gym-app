package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

// PushService manda push notifications via el servicio gratuito de Expo.
// No requiere credenciales propias (Expo maneja APNs/FCM detrás de escena).
type PushService interface {
	Send(ctx context.Context, expoPushToken, title, body string) error
}

type pushService struct {
	httpClient *http.Client
}

func NewPushService() PushService {
	return &pushService{httpClient: &http.Client{}}
}

func (s *pushService) Send(ctx context.Context, expoPushToken, title, body string) error {
	if expoPushToken == "" {
		// El usuario no registró el dispositivo para push todavía - no es un error.
		return nil
	}

	payload := map[string]interface{}{
		"to":    expoPushToken,
		"title": title,
		"body":  body,
		"sound": "default",
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("error marshaling push payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://exp.host/--/api/v2/push/send", bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("error creating push request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("error sending push: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("expo push API returned status %d", resp.StatusCode)
	}

	return nil
}
