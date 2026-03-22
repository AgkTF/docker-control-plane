package api

import (
	"net/http"
	"strings"

	"github.com/docker-control-plane/dcp/internal/store"
)

func SetupRoutes(mux *http.ServeMux, store *store.Store) {
	handler := NewHandler(store)

	mux.HandleFunc("/api/projects", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handler.ListProjects(w, r)
		case http.MethodPost:
			handler.CreateProject(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/projects/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		
		// Handle /api/projects/validate endpoint
		if path == "/api/projects/validate" {
			if r.Method == http.MethodPost {
				handler.ValidatePath(w, r)
			} else {
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
			return
		}

		// Handle specific project endpoints
		if strings.HasPrefix(path, "/api/projects/") {
			switch r.Method {
			case http.MethodGet:
				handler.GetProject(w, r)
			case http.MethodDelete:
				handler.DeleteProject(w, r)
			default:
				w.WriteHeader(http.StatusMethodNotAllowed)
			}
			return
		}

		w.WriteHeader(http.StatusNotFound)
	})
}
