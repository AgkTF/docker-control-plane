package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/docker-control-plane/dcp/internal/compose"
	"github.com/docker-control-plane/dcp/internal/store"
)

type Handler struct {
	store *store.Store
}

func NewHandler(store *store.Store) *Handler {
	return &Handler{store: store}
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
	
	project, err := h.store.GetProjectByID(id)
	if err != nil {
		h.sendError(w, http.StatusNotFound, "PROJECT_NOT_FOUND", "Project not found")
		return
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
