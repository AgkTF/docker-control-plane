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
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	Path              string    `json:"path"`
	ComposeFile       string    `json:"compose_file"`
	HasMissingCompose bool      `json:"has_missing_compose"`
	CreatedAt         time.Time `json:"created_at"`
}

type Container struct {
	ID      string        `json:"id"`
	Name    string        `json:"name"`
	Project string        `json:"project"`
	Service string        `json:"service"`
	Image   string        `json:"image"`
	Status  string        `json:"status"`
	State   string        `json:"state"`
	Ports   []PortMapping `json:"ports"`
}

type PortMapping struct {
	Host      string `json:"host"`
	Container string `json:"container"`
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

// ContainerStats represents resource usage statistics for a container
type ContainerStats struct {
	CPUPercentage    float64 `json:"cpu_percentage"`
	MemoryPercentage float64 `json:"memory_percentage"`
	PIDs             int     `json:"pids"`
}
