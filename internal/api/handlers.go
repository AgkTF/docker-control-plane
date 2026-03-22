package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/docker-control-plane/dcp/internal/compose"
	"github.com/docker-control-plane/dcp/internal/docker"
	"github.com/docker-control-plane/dcp/internal/store"
)

type Handler struct {
	store        *store.Store
	dockerClient *docker.Client
}

func NewHandler(store *store.Store, dockerClient *docker.Client) *Handler {
	return &Handler{
		store:        store,
		dockerClient: dockerClient,
	}
}

func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.store.ListProjects()
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list projects")
		return
	}

	h.sendJSON(w, http.StatusOK, projects)
}

func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid JSON body")
		return
	}

	// Validate path exists
	if err := compose.ValidateDirectory(req.Path); err != nil {
		h.sendError(w, http.StatusBadRequest, "INVALID_PATH", err.Error())
		return
	}

	// Check for duplicate
	existing, err := h.store.GetProjectByPath(req.Path)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to check for duplicate")
		return
	}
	if existing != nil {
		h.sendError(w, http.StatusConflict, "DUPLICATE_PATH", "Project already exists for this path")
		return
	}

	// Find compose file
	composePath, err := compose.FindComposeFile(req.Path)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, "NO_COMPOSE_FILE", "No docker-compose.yml or compose.yaml found in directory")
		return
	}

	// Get project name
	name := req.Name
	if name == "" {
		name, err = compose.ExtractProjectName(req.Path, composePath)
		if err != nil {
			name = filepath.Base(req.Path)
		}
	}

	// Create project
	project, err := h.store.CreateProject(name, req.Path, filepath.Base(composePath))
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create project")
		return
	}

	h.sendJSON(w, http.StatusCreated, project)
}

func (h *Handler) GetProject(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/projects/"):]
	
	storeProject, err := h.store.GetProjectByID(id)
	if err != nil {
		h.sendError(w, http.StatusNotFound, "PROJECT_NOT_FOUND", "Project not found")
		return
	}

	// Check if compose file exists
	composePath := filepath.Join(storeProject.Path, storeProject.ComposeFile)
	hasMissingCompose := false
	if _, err := os.Stat(composePath); os.IsNotExist(err) {
		hasMissingCompose = true
	}

	project := Project{
		ID:                storeProject.ID,
		Name:              storeProject.Name,
		Path:              storeProject.Path,
		ComposeFile:       storeProject.ComposeFile,
		HasMissingCompose: hasMissingCompose,
		CreatedAt:         storeProject.CreatedAt,
	}

	h.sendJSON(w, http.StatusOK, project)
}

func (h *Handler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/projects/"):]
	
	if err := h.store.DeleteProject(id); err != nil {
		h.sendError(w, http.StatusNotFound, "PROJECT_NOT_FOUND", "Project not found")
		return
	}

	h.sendJSON(w, http.StatusOK, map[string]string{"message": "Project deleted"})
}

func (h *Handler) ListContainers(w http.ResponseWriter, r *http.Request) {
	// Extract project ID from path: /api/projects/:id/containers
	path := r.URL.Path
	// Remove /api/projects/ prefix and /containers suffix
	if !strings.HasSuffix(path, "/containers") {
		h.sendError(w, http.StatusBadRequest, "INVALID_PATH", "Invalid path")
		return
	}
	
	id := path[len("/api/projects/") : len(path)-len("/containers")]
	
	// Get project details
	project, err := h.store.GetProjectByID(id)
	if err != nil {
		h.sendError(w, http.StatusNotFound, "PROJECT_NOT_FOUND", "Project not found")
		return
	}

	// Get containers for this project from Docker
	containers, err := h.dockerClient.ListContainersByProject(r.Context(), project.Name)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, "DOCKER_ERROR", fmt.Sprintf("Failed to list containers: %v", err))
		return
	}

	// Convert to API types
	result := make([]Container, len(containers))
	for i, c := range containers {
		result[i] = Container{
			ID:      c.ID,
			Name:    c.Name,
			Project: c.Project,
			Service: c.Service,
			Image:   c.Image,
			Status:  c.Status,
			State:   c.State,
			Ports:   convertPortMappings(c.Ports),
		}
	}

	h.sendJSON(w, http.StatusOK, result)
}

func convertPortMappings(ports []docker.PortMapping) []PortMapping {
	result := make([]PortMapping, len(ports))
	for i, p := range ports {
		result[i] = PortMapping{
			Host:      p.Host,
			Container: p.Container,
		}
	}
	return result
}

func (h *Handler) ValidatePath(w http.ResponseWriter, r *http.Request) {
	var req ValidatePathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.sendError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid JSON body")
		return
	}

	// Check if already exists
	existing, _ := h.store.GetProjectByPath(req.Path)
	if existing != nil {
		resp := ValidatePathResponse{
			Valid: false,
			Error: "Project already added",
		}
		h.sendJSON(w, http.StatusOK, resp)
		return
	}

	// Validate directory
	if err := compose.ValidateDirectory(req.Path); err != nil {
		resp := ValidatePathResponse{
			Valid: false,
			Error: fmt.Sprintf("Path does not exist: %s", err.Error()),
		}
		h.sendJSON(w, http.StatusOK, resp)
		return
	}

	// Find compose file
	composePath, err := compose.FindComposeFile(req.Path)
	if err != nil {
		resp := ValidatePathResponse{
			Valid: false,
			Error: "No compose file found in directory",
		}
		h.sendJSON(w, http.StatusOK, resp)
		return
	}

	// Extract name
	name, err := compose.ExtractProjectName(req.Path, composePath)
	if err != nil {
		name = filepath.Base(req.Path)
	}

	resp := ValidatePathResponse{
		Valid:       true,
		ComposeFile: filepath.Base(composePath),
		Name:        name,
	}
	h.sendJSON(w, http.StatusOK, resp)
}

func (h *Handler) sendJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ResponseEnvelope{
		Data:  data,
		Error: nil,
	})
}

func (h *Handler) sendError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ResponseEnvelope{
		Data: nil,
		Error: &APIError{
			Code:    code,
			Message: message,
		},
	})
}
