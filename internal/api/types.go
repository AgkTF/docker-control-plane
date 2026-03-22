package api

import "time"

type ResponseEnvelope struct {
	Data  interface{} `json:"data"`
	Error *APIError   `json:"error"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	ComposeFile string    `json:"compose_file"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateProjectRequest struct {
	Path        string `json:"path"`
	Name        string `json:"name,omitempty"`
	ComposeFile string `json:"compose_file,omitempty"`
}

type ValidatePathRequest struct {
	Path string `json:"path"`
}

type ValidatePathResponse struct {
	Valid       bool   `json:"valid"`
	ComposeFile string `json:"compose_file,omitempty"`
	Name        string `json:"name,omitempty"`
	Error       string `json:"error,omitempty"`
}
