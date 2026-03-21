# Plan: Docker Control Plane (dcp)

> Source PRD: PRD.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - `GET /api/projects` - List all projects
  - `POST /api/projects` - Add a new project
  - `GET /api/projects/:id` - Get project details
  - `DELETE /api/projects/:id` - Remove a project
  - `GET /api/projects/:id/containers` - List containers for project
  - `POST /api/containers/:id/start` - Start container
  - `POST /api/containers/:id/stop` - Stop container
  - `POST /api/containers/:id/restart` - Restart container

- **Schema**:
  - `projects` table with columns: id, name, path, compose_file, created_at

- **Key models**:
  - `Project`: id, name, path, compose_file, created_at
  - `Container`: id, name, project, service, image, status, state, ports

- **Frontend routes**:
  - `/` - Project list
  - `/projects/:id` - Project detail with containers

- **Configuration**:
  - Port: 8080 (default), configurable via CLI flag `--port`, env `PORT`, or config file
  - Local-only mode: `--local-only` flag binds to 127.0.0.1 instead of 0.0.0.0

---

## Phase 1: Project Scaffolding & Hello World

**User stories**: Foundation for all stories (infrastructure)

### What to build

Set up the complete project structure with both backend and frontend that can build and run. The Go server should start and serve a minimal React frontend that displays "Hello World". This establishes the development workflow, build pipeline, and embedding of static files.

### Acceptance criteria

- [ ] Go project initialized with `go.mod`
- [ ] Standard project structure created (`cmd/server`, `internal/`, `frontend/`)
- [ ] Go server starts and listens on configured port
- [ ] React + Vite + TypeScript project initialized in `frontend/`
- [ ] React app builds to `frontend/dist/`
- [ ] Go binary embeds and serves React build
- [ ] `make dev` runs Go backend
- [ ] `make build` produces single binary that serves the frontend
- [ ] Running binary shows "Hello World" page in browser

---

## Phase 2: Add & List Projects

**User stories**: 1, 2, 4, 5, 6

### What to build

Implement project management: add a project by directory path, list all projects, validate compose file exists. This includes SQLite storage for projects, Docker compose file detection, and a UI to add projects with validation.

### Acceptance criteria

- [ ] SQLite database initialized on first run
- [ ] `projects` table created with proper schema
- [ ] `GET /api/projects` returns all stored projects
- [ ] `POST /api/projects` accepts `{path, name?, compose_file?}` and creates project
- [ ] Frontend has "Add Project" button/modal on project list page
- [ ] AddProjectModal component allows entering a directory path
- [ ] Backend validates directory exists
- [ ] Backend checks for `docker-compose.yml` or `compose.yaml`
- [ ] Backend extracts project name from compose file or directory name
- [ ] Project persisted to SQLite with generated ID
- [ ] Success/error feedback shown in UI
- [ ] Project appears in list after successful add
- [ ] Duplicate path detection returns clear error
- [ ] Invalid directory shows validation error

---

## Phase 3: View Project & Containers

**User stories**: 3, 7, 8, 9, 10, 11, 12, 14

### What to build

Implement the project detail view that shows all containers for a project. List containers for a project by querying Docker API for containers with matching `com.docker.compose.project` label. Display container name, service, image, status, state, and ports. Support removing projects and handle missing compose files gracefully.

### Acceptance criteria

- [ ] `GET /api/projects/:id` returns project details
- [ ] `GET /api/projects/:id/containers` returns containers for project
- [ ] Docker client queries containers by `com.docker.compose.project` label
- [ ] Project detail page shows container table
- [ ] Container table displays: name, service, image, status, state, ports
- [ ] Projects without running containers show empty state
- [ ] Projects with missing compose files show "missing" status indicator
- [ ] Delete project removes from database
- [ ] Only containers from added projects are shown (no system containers)

---

## Phase 4: Container Control

**User stories**: 15, 16, 17, 18

### What to build

Implement container actions: start, stop, restart. Each action calls the Docker API and returns success/error response. UI shows action buttons per container and displays toast notifications for results.

### Acceptance criteria

- [ ] `POST /api/containers/:id/start` calls Docker API to start container
- [ ] `POST /api/containers/:id/stop` calls Docker API to stop container
- [ ] `POST /api/containers/:id/restart` calls Docker API to restart container
- [ ] Action buttons appear for each container (start/stop/restart)
- [ ] Buttons disabled based on current container state
- [ ] Success toast shown on successful action
- [ ] Error toast shown with error message on failure
- [ ] Container list refreshes after action completes

---

## Phase 5: Auto-Refresh & Polish

**User stories**: 13, 19, 20, 21, 22, 23, 24, 25

### What to build

Add automatic polling for container status updates. Implement configuration support (port, local-only mode). Add error handling with consistent error envelope responses. Polish UI with loading states and error boundaries.

### Acceptance criteria

- [ ] Container list polls for updates every 2 seconds
- [ ] Polling pauses when window is not visible
- [ ] React Query manages polling and caching
- [ ] `--port` flag sets server port (default 8080)
- [ ] `PORT` environment variable sets server port
- [ ] `--local-only` flag binds to 127.0.0.1 instead of 0.0.0.0
- [ ] Config file support at `~/.config/dcp/config.yaml`
- [ ] All API responses use consistent JSON envelope `{data, error}`
- [ ] Error codes defined for common error scenarios
- [ ] 404 returns proper error response
- [ ] Docker API errors return user-friendly messages
- [ ] Single binary produced by `make build`
- [ ] Binary runs without external dependencies