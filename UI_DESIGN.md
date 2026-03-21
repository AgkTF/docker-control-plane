# UI/UX Design Document: Docker Control Plane (dcp)

## 1. Design Philosophy

**Core Principles:**
- **Function-first**: Every element serves a purpose, no decorative fluff
- **Scanability**: Information hierarchy allows quick status assessment
- **Confidence**: Clear feedback for every action, no guessing games
- **Efficiency**: Bulk actions and keyboard shortcuts for power users

---

## 2. Color System

### Light Mode

| Token | Value | Usage |
|-------|--------|-------|
| `--bg-primary` | `#ffffff` | Page background |
| `--bg-secondary` | `#f8fafc` | Cards, hover states |
| `--bg-tertiary` | `#f1f5f9` | Nested elements |
| `--text-primary` | `#0f172a` | Headings, labels |
| `--text-secondary` | `#64748b` | Descriptions, hints |
| `--text-muted` | `#94a3b8` | Disabled, timestamps |
| `--border` | `#e2e8f0` | Separators |
| `--accent` | `#3b82f6` | Primary actions, links |
| `--success` | `#10b981` | Running status, success |
| `--warning` | `#f59e0b` | Paused status, warnings |
| `--danger` | `#ef4444` | Stopped/failed, destructive |
| `--info` | `#06b6d4` | Informational |

### Dark Mode

| Token | Value |
|-------|--------|
| `--bg-primary` | `#0f172a` |
| `--bg-secondary` | `#1e293b` |
| `--bg-tertiary` | `#334155` |
| `--text-primary` | `#f1f5f9` |
| `--text-secondary` | `#94a3b8` |
| `--text-muted` | `#64748b` |
| `--border` | `#334155` |
| `--accent` | `#60a5fa` |
| `--success` | `#34d399` |
| `--warning` | `#fbbf24` |
| `--danger` | `#f87171` |
| `--info` | `#22d3ee` |

---

## 3. Typography

**Font Stack:** System font stack for native feel

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace; /* for code/paths */
```

**Scale:**

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page Title | `24px / 1.5rem` | `600` | `1.2` |
| Section Header | `18px / 1.125rem` | `600` | `1.4` |
| Card Title | `16px / 1rem` | `500` | `1.5` |
| Body | `14px / 0.875rem` | `400` | `1.5` |
| Caption | `12px / 0.75rem` | `400` | `1.4` |
| Mono (IDs, paths) | `13px / 0.8125rem` | `400` | `1.4` |

---

## 4. Layout Structure

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header (Logo + App Name + Status Indicator)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                     Main Content                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Footer (Version + Connection Status)                    │
└─────────────────────────────────────────────────────────┘
```

**Container Width:** `max-w-7xl` with responsive padding
**Content Padding:** `px-4 md:px-6 lg:px-8`
**Card Spacing:** `gap-4` between cards
**Section Spacing:** `gap-6` between sections

---

## 5. Component Hierarchy

### 5.1 Header

```
┌─────────────────────────────────────────────────────────┐
│ [🐳] Docker Control Plane              [Status: Connected] │
└─────────────────────────────────────────────────────────┘
```

- **Logo:** Docker icon + "Docker Control Plane" (links to `/`)
- **Status Indicator:** Connection status pill (green = connected, red = disconnected)
- **Height:** `56px`

**Tailwind Classes:**
```html
<header class="h-14 border-b border-[--border] bg-[--bg-primary] px-6 flex items-center justify-between">
  <a href="/" class="flex items-center gap-2 text-[--text-primary] font-semibold">
    <!-- Logo -->
  </a>
  <div class="flex items-center gap-2 text-sm">
    <span class="w-2 h-2 rounded-full bg-[--success]"></span>
    <span class="text-[--text-secondary]">Connected</span>
  </div>
</header>
```

---

### 5.2 Footer

```
┌─────────────────────────────────────────────────────────┐
│ v1.0.0 · Connected · Last updated: 2s ago               │
└─────────────────────────────────────────────────────────┘
```

**Tailwind Classes:**
```html
<footer class="h-12 border-t border-[--border] bg-[--bg-primary] px-6 flex items-center justify-between text-sm text-[--text-muted]">
  <span>v1.0.0</span>
  <span>Last updated: just now</span>
</footer>
```

---

### 5.3 Project Card (List View)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────┐                                                              │
│ │ 🟢  │  media-server                              Running (5/6)     │
│ └─────┘  /home/user/docker/media-server                              │
│         docker-compose.yml · Added 2 days ago                        │
│                                                                      │
│         [View Containers]  [Start All]  [Stop All]  [Remove]        │
└─────────────────────────────────────────────────────────────────────┘
```

**States:**

| State | Visual Treatment |
|-------|-----------------|
| Normal | Solid border `--border` |
| Hover | Elevated shadow, border slightly darker |
| Missing Compose | Yellow warning icon, dashed border `--warning` |
| All Stopped | Grey status badge, muted colors |

**Elements:**

| Element | Description |
|---------|-------------|
| Status Dot | Color-coded: green (running), yellow (partial), grey (stopped), red (error) |
| Project Name | Bold, truncated at 200px, hover shows full name |
| Path | Mono font, truncated, shows on hover |
| Compose File | Badge showing detected file name |
| Container Count | "Running (X/Y)" format |
| Actions | Button group (primary + secondary variants) |

**Tailwind Classes:**
```html
<div class="bg-[--bg-primary] border border-[--border] rounded-lg p-4 hover:shadow-md transition-shadow">
  <div class="flex items-start gap-3">
    <div class="w-2 h-2 mt-2 rounded-full bg-[--success]"></div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-[--text-primary] truncate">media-server</h3>
        <span class="text-sm text-[--text-secondary]">Running (5/6)</span>
      </div>
      <p class="text-sm text-[--text-muted] font-mono truncate">/home/user/docker/media-server</p>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-xs px-2 py-0.5 bg-[--bg-secondary] rounded">docker-compose.yml</span>
        <span class="text-xs text-[--text-muted]">5 containers</span>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <button class="btn-primary">View</button>
        <button class="btn-secondary">Start All</button>
        <button class="btn-secondary">Stop All</button>
        <button class="btn-ghost">Remove</button>
      </div>
    </div>
  </div>
</div>
```

---

### 5.4 Container Table Row (Project Detail View)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ☑ │ 🟢 │ media-server │ nginx-proxy │ nginx:alpine │ 80:80, 443:443 │ ⏹ ✓ ⏵│
└────────────────────────────────────────────────────────────────────────────┘
```

**Table Columns:**

| Column | Width | Content |
|--------|-------|---------|
| Checkbox | `32px` | Bulk select |
| Status | `8px` | Status dot |
| Project | `120px` | Container project label |
| Service | `flex-1` | Service name |
| Image | `200px` | Image name (truncated) |
| Ports | `150px` | Port mappings |
| Actions | `100px` | Stop/Start/Restart buttons |

**Row States:**

| State | Visual | Actions Available |
|-------|--------|-------------------|
| Running | Green dot | Stop, Restart |
| Stopped | Grey dot | Start, Restart |
| Paused | Yellow dot | Unpause, Stop, Restart |
| Error | Red dot | Start, Restart |
| Hover | Background highlight | Actions visible |

**Tailwind Classes:**
```html
<tr class="border-b border-[--border] hover:bg-[--bg-secondary] transition-colors">
  <td class="w-8">
    <input type="checkbox" class="rounded border-[--border]" />
  </td>
  <td class="w-8">
    <div class="w-2 h-2 rounded-full bg-[--success]"></div>
  </td>
  <td class="py-3 text-[--text-secondary]">media-server</td>
  <td class="py-3 font-medium text-[--text-primary]">nginx-proxy</td>
  <td class="py-3 text-[--text-secondary] font-mono text-sm">nginx:alpine</td>
  <td class="py-3 text-[--text-muted] text-sm">80:80, 443:443</td>
  <td class="py-3">
    <div class="flex items-center gap-1">
      <button class="btn-icon" title="Stop">
        <StopIcon class="w-4 h-4" />
      </button>
      <button class="btn-icon" title="Restart">
        <RestartIcon class="w-4 h-4" />
      </button>
    </div>
  </td>
</tr>
```

---

### 5.5 Status Badge

| State | Color | Icon | Label |
|-------|-------|------|-------|
| Running | `--success` | `●` | "Running" |
| Stopped | `--text-muted` | `○` | "Stopped" |
| Paused | `--warning` | `◐` | "Paused" |
| Error | `--danger` | `●` | "Error" |
| Missing | `--warning` | `⚠` | "Compose Missing" |

**Tailwind Classes:**
```html
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
  Running
</span>
```

---

### 5.6 Buttons

**Primary Button:**
```html
<button class="px-3 py-1.5 bg-[--accent] hover:bg-blue-600 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  Start
</button>
```

**Secondary Button:**
```html
<button class="px-3 py-1.5 bg-[--bg-secondary] hover:bg-[--bg-tertiary] border border-[--border] rounded font-medium text-sm text-[--text-primary] transition-colors">
  Stop All
</button>
```

**Ghost Button:**
```html
<button class="px-3 py-1.5 hover:bg-[--bg-secondary] rounded font-medium text-sm text-[--text-secondary] transition-colors">
  Remove
</button>
```

**Destructive Button:**
```html
<button class="px-3 py-1.5 bg-[--danger] hover:bg-red-600 text-white rounded font-medium text-sm transition-colors">
  Delete
</button>
```

**Icon Button:**
```html
<button class="p-1.5 hover:bg-[--bg-secondary] rounded text-[--text-secondary] hover:text-[--text-primary] transition-colors">
  <Icon class="w-4 h-4" />
</button>
```

---

### 5.7 Modal Dialog

```
┌────────────────────────────────────────────┐
│  Remove Project                      [✕]  │
├────────────────────────────────────────────┤
│                                            │
│  Are you sure you want to remove           │
│  "media-server"?                           │
│                                            │
│  This will only remove it from the list.   │
│  Containers will not be stopped or deleted.│
│                                            │
│                                            │
│              [Cancel]  [Remove]             │
└────────────────────────────────────────────┘
```

**Overlay:** `bg-black/50 backdrop-blur-sm`
**Container:** `bg-[--bg-primary] rounded-lg shadow-xl max-w-md`

**Tailwind Classes:**
```html
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-[--bg-primary] rounded-lg shadow-xl max-w-md w-full">
    <div class="flex items-center justify-between p-4 border-b border-[--border]">
      <h2 class="font-semibold text-[--text-primary]">Remove Project</h2>
      <button class="text-[--text-muted] hover:text-[--text-primary]"><XIcon /></button>
    </div>
    <div class="p-4">
      <p class="text-[--text-secondary]">
        Are you sure you want to remove "media-server"?
      </p>
      <p class="text-sm text-[--text-muted] mt-2">
        This will only remove it from the list.
        Containers will not be stopped or deleted.
      </p>
    </div>
    <div class="flex justify-end gap-2 p-4 border-t border-[--border]">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-destructive">Remove</button>
    </div>
  </div>
</div>
```

---

### 5.8 Toast Notifications

Position: Bottom-right corner
Duration: 5 seconds (auto-dismiss), persists on error

**Success Toast:**
```
┌────────────────────────────────────┐
│ ✓  nginx-proxy started            │
│ Container is now running          │
│                            [✕]    │
└────────────────────────────────────┘
```

**Error Toast:**
```
┌────────────────────────────────────┐
│ ✕  Failed to stop container       │
│ Container is in use by another     │
│ process. [Retry]            [✕]    │
└────────────────────────────────────┘
```

**Tailwind Classes:**
```html
<div class="fixed bottom-4 right-4 z-50">
  <div class="bg-[--bg-primary] border border-[--border] rounded-lg shadow-lg p-4 max-w-sm">
    <div class="flex items-start gap-3">
      <div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
        <CheckIcon class="w-3 h-3 text-green-600" />
      </div>
      <div class="flex-1">
        <p class="font-medium text-[--text-primary]">nginx-proxy started</p>
        <p class="text-sm text-[--text-secondary]">Container is now running</p>
      </div>
      <button class="text-[--text-muted] hover:text-[--text-primary]">
        <XIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
```

---

### 5.9 Input Field

```html
<div>
  <label class="block text-sm font-medium text-[--text-primary] mb-1">
    Project Path
  </label>
  <input
    type="text"
    class="w-full px-3 py-2 bg-[--bg-primary] border border-[--border] rounded font-mono text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent"
    placeholder="/path/to/project"
  />
  <p class="mt-1 text-sm text-[--text-muted]">
    Enter the directory containing docker-compose.yml
  </p>
</div>
```

---

### 5.10 Checkbox

```html
<label class="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    class="w-4 h-4 rounded border-[--border] text-[--accent] focus:ring-[--accent] focus:ring-offset-0"
  />
  <span class="text-sm text-[--text-primary]">Select all</span>
</label>
```

---

## 6. Page Designs

### 6.1 Project List Page (`/`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Projects                                              [+ Add Project]    │
│  ───────────────────────────────────────────────────────────────────────────││
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    ││    │ │ 🟢 media-server                                          Running (5/6)│    ││    │ │    /home/user/docker/media-server                                 │    ││    │ │    docker-compose.yml · 5 containers                               │    ││    │ │                                    [View] [Start All] [Stop All]   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ○  home-assistant                                     Stopped (0/4)│    ││    │ │    /home/user/docker/home-assistant                                │    ││    │ │    docker-compose.yml · 4 containers                               │    ││    │ │                                    [View] [Start All] [Restart All]│   │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ⚠  monitoring                                    Compose File Missing│   │
│  │    /home/user/docker/monitoring                                        │    │
│  │    docker-compose.yml was moved or deleted                             │    │
│  │                                    [View] [Remove]                     │    │
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Footer: v1.0.0 · Connected · Last updated: 2s ago# │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Project Detail Page (`/projects/:id`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Back to Projects                       media-server     Running (5/6)   │
│  ───────────────────────────────────────────────────────────────────────────││
│  /home/user/docker/media-server                                             │
│  ─────────────────────────────────────────────────────────────────────────── ││
│                                                                             │
│  [Start All]  [Stop All]  [Restart All]    [Scan]        [Remove Project]   │
│                                                                             │
│  Containers 6 containers                        [Search input]           │
│  ─────────────────────────────────────────────────────────────────────────── ││
│                                                                             │
│  ☑ [Stop All Selected] [Start All Selected] [Restart All Selected]  │      │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │☑│🟢│media-server│nginx-proxy │nginx:alpine │80:80, 443:443│ ⏹ ⏵ ✓      │    │
│  │☑│🟢│media-server│plex        │plexinc/pms   │32400:32400   │ ⏹ ⏵ ✓       │    │
│  │☑│🟢│media-server│sonarr      │linuxserver/  │8989:8989     │ ⏹ ⏵ ✓        │    │
│  │☑│🟢│media-server│radarr      │linuxserver/  │7878:7878     │ ⏹ ⏵ ✓│          │
│  │☑│🟢│media-server│transmission │linuxserver/  │9091:9091     │ ⏹ ⏵ ✓       │
│  │☐│○│media-server│sabnzbd     │linuxserver/  │8080:8080     │ ▶ ⏵ ✓        │    │
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Footer: Auto-refresh: 2s · 6 containers · Last updated: just now│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.3 Add Project Modal

```
┌──────────────────────────────────────────────┐
│ Add Project                           [✕]   │
├──────────────────────────────────────────────┤
│                                              │
│ Project Path *                              │
│ ┌────────────────────────────────────────┐│ │
│ │ /home/user/docker/my-project           │   │
│ └────────────────────────────────────────┘│  │
│ Enter the directory containing your          │
│ docker-compose.yml or compose.yaml file    │
│                                              │
│ ✓ Detected: docker-compose.yml               │
│                                              │
│                    [Cancel]  [Add Project]   │
└──────────────────────────────────────────────┘
```

**Validation States:**

| State | Message | Color |
|-------|---------|-------|
| Valid | `✓ Detected: docker-compose.yml` | Green |
| Invalid path | `✕ Path does not exist` | Red |
| No compose file | `✕ No compose file found in directory` | Red |
| Duplicate | `✕ Project already added` | Red |

---

### 6.4 Empty State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                           [🐳 Container Icon]                              │
│                                                                             │
│                             No projects yet                                │
│                                                                             │
│              Add your first Docker Compose project to get started          │
│                                                                             │
│                          [+ Add Project]                                    │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.5 Error State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                           [⚠ Error Icon]                                   │
│                                                                             │
│                          Unable to connect                                │
│                                                                             │
│                    Docker daemon is not running or not accessible         │
│                                                                             │
│                          [Retry]  [View Logs]                              │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Interaction Patterns

### 7.1 State Transitions

```
[Stopped] --Start--> [Starting...] --success--> [Running]
[Running] --Stop--> [Stopping...] --success--> [Stopped]
[Running] --Restart--> [Restarting...] --success--> [Running]
[Stopped] --Restart--> [Starting...] --success--> [Running]
```

**Action Feedback Flow:**

1. Button shows loading spinner (disabled state)
2. Row shows "in-progress" animation (pulsing border/dot)
3. Toast notification on completion (success/error)
4. Container row updates with new state
5. Page header status updates

---

### 7.2 Bulk Actions Flow

1. User clicks checkboxes (multi-select enabled)
2. Bulk action bar appears at top of container list
3. User clicks action (Start All Selected)
4. All selected rows show loading state simultaneously
5. Results aggregated in single toast: "5 containers started"

---

### 7.3 Add Project Flow

1. User clicks "Add Project" button
2. Modal opens with path input focused
3. User types/pastes path
4. System validates in real-time:
   - ✅ Path exists → show green check
   - ✅ Compose file found → show detected filename
   - ❌ Invalid path → show "Path does not exist"
   - ❌ No compose file → show "No compose file found"
   - ❌ Duplicate → show "Project already added"
5. User submits (Enter or click button)
6. Toast shows success
7. Auto-navigate to project detail page

---

### 7.4 Remove Project Flow

1. User clicks "Remove" on project card
2. Confirmation modal appears
3. User confirms
4. Project removed from list
5. Toast: "Project 'name' removed"

---

## 8. Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `/` | Focus search/filter | Project detail |
| `Escape` | Close modal / deselect | Global |
| `?` | Show keyboard shortcuts | Global |

---

## 9. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full layout with all columns visible |
| Tablet (768-1023px) | Hide port column, truncate paths |
| Mobile (<768px) | Stack container info to cards |

**Mobile Card View:**

```
┌────────────────────────────────┐
│ ☐ │ 🟢 nginx-proxy      [⏹ ⏵] │
│     nginx:alpine              │
│     Ports: 80:80, 443:443    │
└────────────────────────────────┘
```

---

## 10. Accessibility

- **Focus States:** Visible ring (`ring-2 ring-[--accent]`) on all interactive elements
- **Keyboard Navigation:** Tab through all actions, Enter to activate
- **ARIA Labels:** All buttons have `aria-label` for icon-only buttons
- **Color Contrast:** WCAG AA minimum (4.5:1 for text)
- **Screen Reader:** Status changes announced via `aria-live` regions
- **Motion:** `prefers-reduced-motion` respected for animations

---

## 11. Animation Guidelines

| Animation | Duration | Easing |
|-----------|----------|--------|
| Button hover | `150ms` | `ease-out` |
| Modal open | `200ms` | `ease-out` |
| Toast slide in | `300ms` | `ease-out` |
| Status transition | `200ms` | `ease-in-out` |
| Skeleton pulse | `1.5s` | `ease-in-out` |

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. CSS Variable Tokens

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;

  /* Text */
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  /* Borders */
  --color-border: #e2e8f0;
  --color-border-hover: #cbd5e1;

  /* Actions */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;

  /* Status */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #06b6d4;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
}

.dark {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-border: #334155;
  --color-border-hover: #475569;
  --color-accent: #60a5fa;
  --color-accent-hover: #3b82f6;
}
```

---

## 13. File Structure Recommendation

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   └── StatusDot.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── AddProjectModal.tsx
│   └── containers/
│       ├── ContainerRow.tsx
│       ├── ContainerTable.tsx
│       ├── BulkActionBar.tsx
│       └── ContainerActions.tsx
├── pages/
│   ├── ProjectsPage.tsx
│   └── ProjectDetailPage.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useContainers.ts
│   ├── useToast.ts
│   └── usePolling.ts
├── api/
│   ├── client.ts
│   └── types.ts
├── styles/
│   └── globals.css
└── App.tsx
```

---

## 14. Component API Specifications

### ProjectCard

```typescript
interface ProjectCardProps {
  id: string;
  name: string;
  path: string;
  composeFile: string;
  containerCount: number;
  runningCount: number;
  hasMissingCompose: boolean;
  createdAt: Date;
  onView: (id: string) => void;
  onStartAll: (id: string) => void;
  onStopAll: (id: string) => void;
  onRemove: (id: string) => void;
}
```

### ContainerRow

```typescript
interface ContainerRowProps {
  id: string;
  name: string;
  service: string;
  project: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  ports: string[];
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
}
```

### AddProjectModal

```typescript
interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (path: string) => Promise<void>;
  validatePath: (path: string) => Promise<{ valid: boolean; error?: string }>;
}
```

### Toast

```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}
```

---

## 15. Data Fetching & State Management

### React Query Setup

```typescript
// api/client.ts
const API_BASE = '/api';

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.data;
}

// hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient<Project[]>('/projects'),
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

// hooks/useContainers.ts
export function useContainers(projectId: string) {
  return useQuery({
    queryKey: ['containers', projectId],
    queryFn: () => apiClient<Container[]>(`/projects/${projectId}/containers`),
    refetchInterval: 2000,
  });
}
```

### Polling Strategy

- Poll project list every 5 seconds
- Poll container list every 2 seconds when on project detail page
- Pause polling when window is not focused
- Resume polling when window regains focus

---

## 16. Icon Set

Use [Lucide React](https://lucide.dev/) for icons:

| Icon | Usage |
|------|-------|
| `Play` | Start container |
| `Square` | Stop container |
| `RotateCw` | Restart container |
| `Plus` | Add project |
| `Trash2` | Remove/delete |
| `X` | Close modal |
| `Check` | Success state |
| `AlertTriangle` | Warning state |
| `Info` | Info state |
| `Search` | Search input |
| `ArrowLeft` | Back navigation |
| `RefreshCw` | Refresh/sync |
| `Copy` | Copy to clipboard |
| `ExternalLink` | Open external |
| `ChevronDown` | Dropdown |
| `Loader2` | Loading spinner |

---

This design document provides the foundation for implementing the Docker Control Plane UI. All components follow a consistent design system with Tailwind CSS classes that can be directly applied.