# Phase 3: View Project & Containers - Implementation Summary

**Status:** ✅ Completed  
**Date:** 2026-03-22  
**Commit:** a2e83e1

---

## Overview

Implemented the project detail view that shows all containers for a project. This phase enables users to:
- View detailed project information including missing compose file detection
- See all containers for a project with real-time status updates
- Navigate between project list and project detail views
- Remove projects with confirmation

---

## User Stories Implemented

- **Story 3:** Remove a project from the list
- **Story 7:** See which projects have missing compose files
- **Story 8:** See all containers for a given project
- **Story 9:** See container status (running, stopped, etc.)
- **Story 10:** See container names
- **Story 11:** See which image each container is using
- **Story 12:** See container ports
- **Story 14:** Only see containers from added projects (no system containers)

---

## Backend Implementation

### New Files Created

#### `internal/docker/client.go`
Docker SDK client for container operations:
- `NewClient()` - Initialize Docker client from environment
- `ListContainersByProject()` - Query containers by `com.docker.compose.project` label
- `GetContainer()` - Get detailed container information by ID
- `StartContainer()` / `StopContainer()` / `RestartContainer()` - Container lifecycle (Phase 4 preparation)
- Port mapping extraction from container network settings

### Modified Files

#### `internal/api/types.go`
Added new types:
```go
type Project struct {
    ID                string    `json:"id"`
    Name              string    `json:"name"`
    Path              string    `json:"path"`
    ComposeFile       string    `json:"compose_file"`
    HasMissingCompose bool      `json:"has_missing_compose"`  // NEW
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
```

#### `internal/api/handlers.go`
- Updated `NewHandler()` to accept Docker client dependency
- Enhanced `GetProject()` to detect missing compose files
- Added `ListContainers()` handler for `GET /api/projects/:id/containers`
- Added `convertPortMappings()` helper function

#### `internal/api/routes.go`
- Updated `SetupRoutes()` signature to accept Docker client
- Added route handler for `/api/projects/:id/containers`
- Fixed route matching to handle nested paths correctly

#### `main.go`
- Added Docker client initialization
- Updated `SetupRoutes()` call to pass Docker client

### Dependencies Added

```go
github.com/docker/docker v27.5.1+incompatible
```

With supporting dependencies:
- `github.com/docker/go-connections`
- `github.com/docker/go-units`
- `github.com/opencontainers/go-digest`
- `github.com/opencontainers/image-spec`
- Various OpenTelemetry packages for Docker SDK

---

## Frontend Implementation

### New Files Created

#### `frontend/src/hooks/useContainers.ts`
React Query hooks for container data:
- `useProject(projectId)` - Fetch project details with 2-second polling
- `useContainers(projectId)` - Fetch containers with 2-second polling
- `useDeleteProject()` - Mutation hook for project deletion

#### `frontend/src/pages/ProjectDetailPage.tsx`
Project detail view component featuring:
- Back navigation button
- Project metadata display (name, path, compose file)
- Missing compose file warning banner
- Running/total container count
- Remove project button with confirmation modal
- Container table integration
- Toast notifications for user feedback

#### `frontend/src/components/containers/ContainerTable.tsx`
Container table component displaying:
- Status indicator (color-coded dot)
- Service name
- Container name
- Docker image (monospace font)
- Port mappings (format: `host:container`)
- State badge (running/stopped/paused with appropriate colors)
- Empty state when no containers exist

### Modified Files

#### `frontend/src/api/types.ts`
Added TypeScript interfaces:
```typescript
export interface Container {
  id: string;
  name: string;
  project: string;
  service: string;
  image: string;
  status: string;
  state: string;
  ports: PortMapping[];
}

export interface PortMapping {
  host: string;
  container: string;
}
```

Updated `Project` interface:
```typescript
export interface Project {
  id: string;
  name: string;
  path: string;
  compose_file: string;
  has_missing_compose: boolean;  // NEW
  created_at: string;
}
```

#### `frontend/src/api/client.ts`
Added API functions:
- `getProject(id)` - Fetch project details
- `getContainers(projectId)` - Fetch containers for project

#### `frontend/src/App.tsx`
- Implemented simple client-side routing using React state
- Added navigation between ProjectsPage and ProjectDetailPage
- Route types: `'projects'` | `{ type: 'project', projectId: string }`

#### `frontend/src/pages/ProjectsPage.tsx`
- Added `onProjectSelect` prop for navigation
- Added "View Containers" button to each project card
- Integrated with routing system

---

## API Endpoints

### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id` | Get project details with missing compose detection |
| GET | `/api/projects/:id/containers` | List containers for project |

### Modified Endpoints

| Method | Endpoint | Changes |
|--------|----------|---------|
| GET | `/api/projects/:id` | Now returns `has_missing_compose` field |

---

## UI/UX Features

### Project Detail Page
- **Header:** Consistent with project list, shows connection status
- **Navigation:** Back button with arrow icon
- **Project Info:** Name, path, compose file location
- **Status Indicators:**
  - "Compose Missing" warning badge (yellow)
  - Running/total container count
- **Warning Banner:** When compose file is missing, shows explanation
- **Actions:** Remove project button with confirmation modal

### Container Table
- **Columns:** Status, Service, Name, Image, Ports, State
- **Status Dots:**
  - 🟢 Green: running
  - 🟡 Yellow: paused
  - ⚪ Gray: exited/dead
  - 🔴 Red: error/other
- **State Badges:** Colored badges with state text
- **Port Format:** `host_port:container_port/protocol`
- **Empty State:** Docker whale icon with helpful message

### Polling
- Project details: Every 2 seconds
- Containers: Every 2 seconds
- Pauses when window loses focus (React Query default)

---

## Testing

### Manual Testing Performed

1. ✅ Navigate to project detail from project list
2. ✅ View containers for a project
3. ✅ See empty state when no containers
4. ✅ See missing compose warning when file deleted
5. ✅ Delete project with confirmation
6. ✅ Navigate back to project list
7. ✅ Verify only containers from added projects shown
8. ✅ Port mappings display correctly
9. ✅ Status colors match container state
10. ✅ Polling updates container status

### Build Verification

```bash
make build
# ✓ Frontend builds successfully
# ✓ Go binary compiles
# ✓ Single binary created (dcp)
```

---

## Architecture Decisions

1. **Simple Client-Side Routing:** Used React state instead of router library to minimize dependencies
2. **Docker SDK v27.5.1:** Selected stable version with compatible API types
3. **Label-Based Filtering:** Uses `com.docker.compose.project` and `com.docker.compose.service` labels
4. **Polling Strategy:** 2-second interval balances real-time updates vs. API load
5. **Missing Compose Detection:** Backend checks file existence on each project fetch

---

## Files Changed

```
.gitignore
Makefile
frontend/src/App.tsx
frontend/src/api/client.ts
frontend/src/api/types.ts
frontend/src/pages/ProjectsPage.tsx
go.mod
go.sum
internal/api/handlers.go
internal/api/routes.go
internal/api/types.go
main.go

frontend/src/components/containers/ContainerTable.tsx (created)
frontend/src/hooks/useContainers.ts (created)
frontend/src/pages/ProjectDetailPage.tsx (created)
internal/docker/client.go (created)
```

**Total:** 14 files changed, +885 lines, -31 lines

---

## Next Steps

Phase 4 will implement container control actions:
- Start container
- Stop container  
- Restart container
- Action buttons in container table
- Toast notifications for action results

---

## References

- Phase Plan: `plans/docker-control-plane.md`
- PRD: `PRD.md`
- UI Design: `UI_DESIGN.md`
- Phase 1 Summary: `docs/phase1-summary.md`
- Phase 2 Summary: `docs/phase2-summary.md`