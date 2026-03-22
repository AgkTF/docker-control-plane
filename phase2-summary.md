# Phase 2 Summary: Add & List Projects

## Overview

Phase 2 of Docker Control Plane (dcp) implements project management functionality, allowing users to add Docker Compose projects by directory path and list all managed projects. This phase establishes the core storage layer, compose file detection, and foundational UI components.

---

## What Was Built

### Backend (Go)

#### 1. SQLite Storage Layer (`internal/store/sqlite.go`)
- **Database**: SQLite with automatic initialization on first run
- **Location**: `~/.local/share/dcp/dcp.db`
- **Schema**: `projects` table with columns:
  - `id` (TEXT PRIMARY KEY) - UUID generated for each project
  - `name` (TEXT NOT NULL) - Project name from compose file or directory
  - `path` (TEXT NOT NULL UNIQUE) - Absolute path to project directory
  - `compose_file` (TEXT NOT NULL) - Name of detected compose file
  - `created_at` (DATETIME) - Project creation timestamp
- **Operations**: Create, Read (by ID or path), List, Delete

#### 2. Compose File Parser (`internal/compose/parser.go`)
- **Supported Files**: 
  - `docker-compose.yml`
  - `docker-compose.yaml`
  - `compose.yml`
  - `compose.yaml`
- **Features**:
  - Directory validation
  - Compose file discovery
  - Project name extraction from compose file's `name` field
  - Fallback to directory name if not specified

#### 3. API Layer (`internal/api/`)
- **Endpoints**:
  - `GET /api/projects` - List all projects
  - `POST /api/projects` - Create new project
  - `GET /api/projects/:id` - Get project details
  - `DELETE /api/projects/:id` - Remove project
  - `POST /api/projects/validate` - Validate path for duplicate detection
- **Request/Response**: JSON envelope with `{data, error}` structure
- **Error Codes**: DUPLICATE_PATH, INVALID_PATH, NO_COMPOSE_FILE, PROJECT_NOT_FOUND

#### 4. Main Application Updates
- Database initialization on startup
- API route registration
- Database cleanup on shutdown

### Frontend (React + TypeScript)

#### 1. API Client (`frontend/src/api/`)
- **TypeScript Types**: Project, CreateProjectRequest, APIResponse interfaces
- **Client Methods**: listProjects, createProject, validatePath, deleteProject
- **Error Handling**: Throws errors with backend messages for UI consumption

#### 2. React Query Hooks (`frontend/src/hooks/useProjects.ts`)
- **useProjects**: Auto-refreshing query for project list (5 second interval)
- **useCreateProject**: Mutation with automatic cache invalidation
- **useDeleteProject**: Mutation with automatic cache invalidation
- **useValidatePath**: Mutation for path validation

#### 3. UI Components (`frontend/src/components/`)

##### ProjectsPage
- Main page component for project list
- Header with "Add Project" button
- Empty state with call-to-action
- Loading and error states
- Footer with version info

##### AddProjectModal
- Modal dialog for adding projects
- Path input with monospace font
- **Real-time validation** (500ms debounce):
  - Validates path exists
  - Checks for compose file
  - Detects duplicate paths
- Visual feedback with icons (Check, AlertCircle)
- Submit button disabled until validation passes

##### ProjectCard
- Card component for displaying project information
- Shows: name, path, compose file, creation date
- Remove button with confirmation dialog

##### Toast
- Toast notification system
- Success/error types
- Auto-dismiss after 5 seconds
- Slide animation
- Multiple toast support

#### 4. Styling
- **Tailwind CSS v4** with PostCSS
- Dark mode support
- Consistent color tokens
- Responsive design

---

## Acceptance Criteria Verification

| Criterion | Status | Notes |
|-----------|--------|-------|
| SQLite database initialized on first run | ✅ | Auto-creates `~/.local/share/dcp/` directory and database |
| `projects` table created with proper schema | ✅ | All columns present with correct types and constraints |
| `GET /api/projects` returns all stored projects | ✅ | Returns array with full project data |
| `POST /api/projects` accepts `{path, name?, compose_file?}` | ✅ | Optional name override, compose_file auto-detected |
| Frontend has "Add Project" button/modal on project list page | ✅ | Button in header, modal with form |
| AddProjectModal allows entering a directory path | ✅ | Text input with monospace styling |
| Backend validates directory exists | ✅ | Returns INVALID_PATH error if not found |
| Backend checks for `docker-compose.yml` or `compose.yaml` | ✅ | Checks all 4 variants in order |
| Backend extracts project name from compose or directory | ✅ | Reads `name` field from YAML, falls back to dir name |
| Project persisted to SQLite with generated ID | ✅ | UUID v4 generated for each project |
| Success/error feedback shown in UI | ✅ | Toast notifications for all operations |
| Project appears in list after successful add | ✅ | React Query invalidates cache automatically |
| Duplicate path detection returns clear error | ✅ | Prevents duplicates with DUPLICATE_PATH error |
| Invalid directory shows validation error | ✅ | Shows "Path does not exist" in modal |

---

## Key Decisions

### 1. Database Location
Stored user data in `~/.local/share/dcp/dcp.db` following XDG Base Directory specification for Linux systems.

### 2. Project Name Resolution
Priority order:
1. User-provided name in request
2. `name` field from compose file YAML
3. Directory name (basename of path)

### 3. Real-Time Validation
Implemented 500ms debounced validation in the modal to provide immediate feedback without excessive API calls.

### 4. Response Envelope
All API responses use consistent JSON structure:
```json
{
  "data": { ... },
  "error": null
}
```
Error responses:
```json
{
  "data": null,
  "error": {
    "code": "DUPLICATE_PATH",
    "message": "Project already exists for this path"
  }
}
```

### 5. Tailwind CSS v4
Used new `@import "tailwindcss"` syntax and `@tailwindcss/postcss` plugin for latest features.

---

## Files Created/Modified

### Backend
- `internal/store/sqlite.go` (new) - Database operations
- `internal/compose/parser.go` (new) - Compose file parsing
- `internal/api/handlers.go` (new) - HTTP handlers
- `internal/api/routes.go` (new) - Route definitions
- `internal/api/types.go` (new) - API types
- `main.go` (modified) - Database initialization and routing
- `go.mod` (modified) - Added SQLite and YAML dependencies

### Frontend
- `frontend/src/api/types.ts` (new) - TypeScript interfaces
- `frontend/src/api/client.ts` (new) - API client
- `frontend/src/hooks/useProjects.ts` (new) - React Query hooks
- `frontend/src/components/ProjectsPage.tsx` (new) - Main page
- `frontend/src/components/AddProjectModal.tsx` (new) - Add project modal
- `frontend/src/components/ProjectCard.tsx` (new) - Project card
- `frontend/src/components/Toast.tsx` (new) - Toast notifications
- `frontend/src/App.tsx` (modified) - React Query provider integration
- `frontend/src/index.css` (modified) - Tailwind imports
- `frontend/package.json` (modified) - Added React Query, Lucide icons
- `frontend/tailwind.config.js` (new) - Tailwind configuration
- `frontend/postcss.config.js` (new) - PostCSS configuration

---

## Testing

### Manual Verification
Tested with curl commands:

```bash
# List projects (empty initially)
curl -s http://localhost:8080/api/projects
# Response: {"data":[],"error":null}

# Validate path
curl -s -X POST http://localhost:8080/api/projects/validate \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/test-project"}'
# Response: {"data":{"valid":true,"compose_file":"docker-compose.yml","name":"test-project"},"error":null}

# Create project
curl -s -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/test-project"}'
# Response: {"data":{"id":"...","name":"test-project",...},"error":null}

# List projects (now with data)
curl -s http://localhost:8080/api/projects
# Response: {"data":[{"id":"...","name":"test-project",...}],"error":null}

# Test duplicate detection
curl -s -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/test-project"}'
# Response: {"data":null,"error":{"code":"DUPLICATE_PATH","message":"Project already exists for this path"}}
```

---

## Dependencies Added

### Go
- `github.com/mattn/go-sqlite3` - SQLite driver
- `github.com/google/uuid` - UUID generation
- `gopkg.in/yaml.v3` - YAML parsing for compose files

### Node.js
- `@tanstack/react-query` - Server state management
- `lucide-react` - Icon library
- `tailwindcss` - CSS framework
- `@tailwindcss/postcss` - PostCSS plugin for Tailwind v4
- `autoprefixer` - CSS post-processor

---

## Architecture Alignment

The implementation follows the architecture defined in Phase 1:

- ✅ Backend: Go with standard library `net/http`
- ✅ Frontend: React SPA with Vite
- ✅ Storage: SQLite for persistence
- ✅ API: REST with consistent envelope
- ✅ Embedding: Static files embedded in Go binary
- ✅ Build: Single binary output

---

## Next Steps (Phase 3)

Phase 3 will implement:
- Project detail view (`/projects/:id`)
- Container listing from Docker API
- Container status display (running, stopped, etc.)
- Container table with name, service, image, status, ports
- Missing compose file status indicator
- Remove project functionality (already partially implemented)

---

## Commit Reference

- **Commit**: `c4a5130`
- **Message**: `feat: implement Phase 2 - Add & List Projects`
- **Files Changed**: 21 files (+1126 lines, -12 lines)
