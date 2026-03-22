# PRD: Docker Control Plane (dcp)

## Problem Statement

Developers and homelab enthusiasts who use Docker Compose to manage multiple services on a single machine lack a simple, local-first web interface to view and control their containers. The Docker CLI is powerful but requires terminal access and memorizing commands. Existing tools like Portainer are designed for multi-host orchestration and add unnecessary complexity for single-machine use cases.

Users need a lightweight, single-binary solution to:
- View all containers grouped by Docker Compose project
- Start, stop, and restart containers
- Manage multiple compose projects from one interface

## Solution

Build a local control plane (`dcp`) — a single-binary web application that:
- Discovers Docker Compose projects on the host machine
- Displays containers grouped by project with real-time status
- Provides start/stop/restart controls via a React-based web UI
- Requires no external dependencies beyond Docker

The application runs as a standalone binary, serving a React SPA embedded within. Users access the UI through a browser, connecting to the server running on their machine or homelab server.

## User Stories

### Project Management

1. As a user, I want to add a Docker Compose project by specifying its directory path, so that I can track its containers
2. As a user, I want to see a list of all added projects, so that I can understand what I'm managing
3. As a user, I want to remove a project from the list, so that I can clean up projects I no longer care about
4. As a user, I want to see which project directory a compose file lives in, so that I can differentiate projects with similar names
5. As a user, I want to be warned if I try to add a duplicate project path, so that I don't accidentally track the same project twice
6. As a user, I want to be prevented from adding a directory without a valid compose file, so that I don't create invalid projects
7. As a user, I want to see which projects have missing compose files, so that I can take corrective action

### Container Visibility

8. As a user, I want to see all containers for a given project, so that I understand what services are running
9. As a user, I want to see container status (running, stopped, etc.), so that I know the health of my services
10. As a user, I want to see container names, so that I can identify individual services
11. As a user, I want to see which image each container is using, so that I understand what's deployed
12. As a user, I want to see container ports, so that I know how to access services
13. As a user, I want the container list to refresh automatically, so that I see current state without manual refresh
14. As a user, I want to only see containers from projects I've explicitly added, so that system containers don't clutter the view

### Container Control

15. As a user, I want to start a stopped container, so that I can bring services online
16. As a user, I want to stop a running container, so that I can take services offline
17. As a user, I want to restart a container, so that I can quickly recover from issues or apply configuration changes
18. As a user, I want to see feedback when an action succeeds or fails, so that I know the result of my actions
19. As a user, I want to perform actions on multiple containers at once, so that I can manage a project efficiently

### Configuration & Deployment

20. As a user, I want to run the application as a single binary, so that deployment is simple
21. As a user, I want to configure the port the server runs on, so that I can avoid port conflicts
22. As a user, I want to run the application in local-only mode, so that I can restrict access when needed
23. As a user, I want to access the UI from a remote machine on the same network, so that I can manage my homelab server

### Error Handling

24. As a user, I want to see clear error messages when something goes wrong, so that I can diagnose issues
25. As a user, I want the application to handle misconfigured projects gracefully, so that one bad project doesn't crash everything

### Future Stories (Out of Scope for MVP)

26. As a user, I want to view container logs, so that I can debug issues
27. As a user, I want to see container resource usage (CPU, memory), so that I can monitor performance
28. As a user, I want to edit compose files, so that I can modify services without leaving the UI
29. As a user, I want to require authentication, so that unauthorized users cannot control my containers
30. As a user, I want to manage containers on multiple hosts, so that I can control all my servers from one place

## Implementation Decisions

### Architecture

- **Backend**: Go with standard library `net/http` for server, `embed` package for serving static files
- **Frontend**: React SPA built with Vite, embedded in Go binary at compile time
- **API**: REST API for CRUD operations, WebSocket for streaming logs (future)
- **Storage**: SQLite for persisting project list and metadata

### Project Structure

```
docker-control-plane/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers.go
│   │   └── routes.go
│   ├── compose/
│   │   └── parser.go
│   ├── config/
│   │   └── config.go
│   ├── docker/
│   │   └── client.go
│   └── store/
│       └── sqlite.go
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
├── go.mod
└── Makefile
```

### API Contract

**Projects**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Add a new project |
| GET | `/api/projects/:id` | Get project details |
| DELETE | `/api/projects/:id` | Remove a project |

**Containers**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/containers` | List containers for project |
| POST | `/api/containers/:id/start` | Start container |
| POST | `/api/containers/:id/stop` | Stop container |
| POST | `/api/containers/:id/restart` | Restart container |

**Response Envelope**

All responses use a consistent JSON envelope:

```json
{
  "data": { ... },
  "error": null
}
```

On error:

```json
{
  "data": null,
  "error": {
    "code": "CONTAINER_NOT_FOUND",
    "message": "Container abc123 does not exist"
  }
}
```

### Data Model

**Project**

```go
type Project struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Path        string    `json:"path"`
    ComposeFile string    `json:"compose_file"`
    CreatedAt   time.Time `json:"created_at"`
}
```

**Container**

```go
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
```

### Configuration

Configuration loaded with priority: CLI flags > environment variables > config file > defaults

| Setting | Default | Config Key | Env Var | CLI Flag |
|---------|---------|------------|---------|----------|
| Port | 8080 | `port` | `PORT` | `--port` |
| Local only | false | `local_only` | `LOCAL_ONLY` | `--local-only` |
| Config file | `~/.config/dcp/config.yaml` | — | — | `--config` |

### Docker Interaction

- Use Go Docker SDK (`github.com/docker/docker/client`) for all Docker operations
- Discover containers via `com.docker.compose.project` label
- Detect both `docker-compose.yml` and `compose.yaml` files

### Frontend Architecture

- **Routes**: `/` (project list), `/projects/:id` (project detail)
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS, minimal components initially
- **API Client**: `fetch` wrapper with TypeScript types

### Build & Development

**Development**

```bash
# Terminal 1: Go backend
go run ./cmd/server

# Terminal 2: React frontend
cd frontend && npm run dev
```

**Production Build**

```bash
make build  # npm run build -> go build with embedded static files
./dcp       # single binary serves both
```

## Testing Decisions

### Philosophy

- Test external behavior, not implementation details
- Use interfaces to enable mocking
- Prefer integration-style tests over unit tests for HTTP handlers
- In-memory SQLite (`:memory:`) for store tests

### Modules to Test

| Module | Test Type | Approach |
|--------|-----------|----------|
| `internal/store` | Unit tests | In-memory SQLite, test CRUD operations |
| `internal/docker` | Unit tests | Mock interface, test wrapper logic |
| `internal/compose` | Unit tests | Pure functions, test file detection |
| `internal/api` | Integration tests | Mock Docker client, test HTTP handlers |

### Modules NOT to Test

- `internal/config`: Thin wrapper, tested via integration
- Frontend: Defer for MVP, add after stability

### Test Examples

**Store Tests**

```go
func TestProjectStore_Create(t *testing.T) {
    db, _ := sql.Open("sqlite3", ":memory:")
    store := store.New(db)
    // Test create, read, delete operations
}
```

**API Integration Tests**

```go
func TestAPI_ListProjects(t *testing.T) {
    mockDocker := &MockDockerClient{}
    handler := api.New(mockDocker, store)
    req := httptest.NewRequest("GET", "/api/projects", nil)
    // Assert response status and body
}
```

## Out of Scope

The following are explicitly out of scope for the MVP:

1. **View container logs** — Deferred to future release
2. **Container resource stats (CPU/memory)** — Deferred
3. **Edit compose files** — Deferred
4. **Authentication/Authorization** — Deferred (network-level security assumed)
5. **Multi-host management** — Single machine only
6. **Auto-discovery of compose files** — Explicit project addition only
7. **Container creation** — Only manage existing containers
8. **Image management** — No pull/build/push images
9. **Volume/network management** — Defer advanced features
10. **Docker Swarm/Kubernetes** — Compose only

## Further Notes

### Security Considerations

- By default, `dcp` binds to `0.0.0.0:8080`, making it network-accessible
- Users should run behind a firewall or VPN for production use
- The `--local-only` flag restricts to `127.0.0.1` for development scenarios
- Authentication is planned for a future release

### Performance Considerations

- Polling interval of 2 seconds is reasonable for local use
- SQLite is sufficient for expected data volume (tens of projects)
- React Query's caching reduces unnecessary API calls

### Future Enhancements (Post-MVP)

Priority order:

1. View logs (WebSocket streaming)
2. Container stats (CPU/memory)
3. Image management (pull/build/push images)
4. Edit compose files
5. Authentication
6. Multi-host support