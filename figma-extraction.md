# ClearStep — Task Management App: Design & Engineering Spec
*Derived from 13 Figma screenshots (Login, Kanban Board, List View, Task Detail, Projects, Account Menu, Settings). Figma editor chrome (rulers, "Ask to edit" toolbar, Properties panel, layer names) was excluded — only actual product UI was extracted.*

---

## 1. Visual Design Tokens & Layout Specifications

### 1.1 Color Palette

| Token | Hex (approx.) | Usage |
|---|---|---|
| `base/background` | `#FFFFFF` | Page/app background (confirmed in Figma layer inspector) |
| `surface/sidebar` | `#FFFFFF` / `#F9FAFB` | Sidebar background |
| `surface/sidebar-active` | `#F3F4F6` | Selected nav item (Tasks highlighted) |
| `surface/card` | `#FFFFFF` with `#E5E7EB` border | Kanban cards, table rows, panels |
| `surface/column-header` | `#F9FAFB` | Kanban column background |
| `text/primary` | `#111827` – `#0A0A0A` | Titles, headings |
| `text/secondary` | `#4B5563` | Body copy, descriptions |
| `text/muted` | `#9CA3AF` | Placeholder text, "Low" priority, timestamps |
| `border/default` | `#E5E7EB` | Card borders, dividers, table borders |
| `cta/primary-bg` | `#0A0A0A` (near-black) | "Continue as Guest", "+ Add Task" buttons |
| `cta/primary-text` | `#FFFFFF` | Text on primary buttons |
| `cta/secondary-bg` | `#FFFFFF` w/ `#E5E7EB` border | "Login with Google" |
| `priority/urgent` | `#EF4444` (red) | Priority bar + label |
| `priority/high` | `#EF4444` / `#F97316` (red-orange) | Priority bar + label ("High" text reads red/orange) |
| `priority/medium` | `#F59E0B` (amber/orange) | Priority bar + label |
| `priority/low` | `#9CA3AF` (gray) | Priority bar + label |
| `priority/none` | `#D1D5DB` | Dot icon, "No Priority" |
| `status/backlog-dot` | `#F59E0B` | Status indicator dot |
| `date/overdue-text` | `#DC2626` | Due date badges (e.g. "29 Jul", "31 Jul") |
| `date/overdue-bg` | `#FEE2E2` | Pill background behind overdue date |
| `date/default-text` | `#111827` | Non-overdue due dates |
| `label-chip/bg` | `#F3F4F6` | Tag chips ("Deployment", "Research", etc.) |
| `label-chip/text` | `#374151` | Tag chip text |
| `danger/text-bg` | `#DC2626` / `#FEE2E2` | "Leave Workspace" button |

**Accent / Color Mode presets** (user-selectable theme accent, seen in Settings → Color Mode):
`Amber #F59E0B` · `Blue #7C3AED*` (swatch shown purple/blue, currently active) · `Pink #EC4899` · `Rose #F43F5E` · `Emerald #10B981` · `Black #111827`

### 1.2 Typography

- **Font family:** Sans-serif, consistent with Inter/system-ui (no custom display font evident).
- **Scale (inferred from screenshots):**
  | Role | Size | Weight |
  |---|---|---|
  | Page/App title (e.g. "Tasks", "Projects") | 20–22px | Semi-bold (600) |
  | Modal/auth heading ("Let's get back on track") | 24–28px | Bold (700) |
  | Task detail title ("Write API Documentation") | 24px | Semi-bold (600) |
  | Card title (Kanban card, table row task name) | 14–15px | Medium (500) |
  | Body/description text | 14px | Regular (400) |
  | Sidebar nav item | 14px | Medium (500) |
  | Badge/label chip text | 12px | Medium (500) |
  | Due date / timestamp | 12–13px | Regular (400) |
  | Table header | 13px | Medium (500), muted color |

### 1.3 Spacing, Grid & Frame Dimensions

- **Design canvas:** Fixed **1280×900px** frames throughout (each screen designed as a fixed viewport, not fluid — build responsive breakpoints from this as the desktop baseline).
- **Sidebar width:** ~240–260px fixed.
- **Login card:** Centered, rounded corners (~12px radius), internal padding ~32–40px, vertical gap between elements ~16–24px, button gap ~12px.
- **Kanban column width:** ~280–300px, gap between columns ~16–24px.
- **Card padding:** ~16px internal padding, ~12px gap between title/meta/labels rows.
- **Table row height:** ~48–56px, cell horizontal padding ~16–24px.
- **Button radius:** Pill/full radius (`9999px`) for primary CTAs (Continue as Guest, Login with Google); standard `8px` radius for smaller in-app buttons ("+ Add Task", "Fields").
- **Dropdown/popover radius:** ~8–12px, subtle shadow, ~4px padding around list items.

---

## 2. Component Hierarchy & Interactive States

### 2.1 App Shell
- **Sidebar**
  - Workspace switcher (avatar + name + chevron, opens account dropdown)
  - Collapsible "Workspace" group label
  - Nav items: **Tasks**, **Projects** (active item gets highlighted background)
  - Sidebar collapse toggle icon in topbar
- **Topbar** (per view)
  - Breadcrumb (e.g. `Projects > Design Homepage`)
  - Page title
  - Search icon → expands to search input with `⌘F` hotkey hint
  - **Fields** button → opens field-visibility dropdown
  - Filter icon → opens filter dropdown (Status, Priority, Members, Due Date, Teams, Labels, Reporter — each with nested submenu arrow)
  - Primary **+ Add Task** / **+ Add Project** button (black pill/rounded button)

### 2.2 Login Screen
- Logo + product name ("Pyramid")
- Card: heading, subtext, **Continue as Guest** (primary, black), **Login with Google** (secondary, white+border, Google icon)
- Legal footnote with underlined **Terms of Service** / **Privacy Policy** links

### 2.3 Kanban Board View (Tasks / Projects)
- **Column**
  - Drag handle icon (⠿) — implies column reordering
  - Column title (To Do / Doing / Completed / On Hold)
  - `+` quick-add icon and `...` overflow menu in header
  - **Task Card**
    - Title
    - `...` card menu
    - Assignee: avatar + role label (Admin/Designer/QA Team/Security)
    - Due date badge (calendar icon + date, red text when overdue)
    - Label chips (multiple, tag icon)
  - **+ Add Task** inline action at column bottom
- **Confirmed drag-and-drop** (per design comment thread from Suyash Shivam / Anish Cowdhury): cards are draggable between columns. The six-dot icon on each card is the drag handle. Comment explicitly requests a **hover state** on cards plus a **visible drag-handle icon on hover** to make the drag affordance clearer — this is a stated requirement, not just a visual detail, so it should be built as an actual hover-revealed handle, not a decorative icon.
- **Confirmed horizontal scroll** (per design comment thread from Arup Kumar Das / Abhijit): the Kanban board scrolls **horizontally** when columns overflow the viewport ("yes, it has to be" — explicit confirmation). Columns (To Do / Doing / Completed / On Hold, and any added beyond) sit in a horizontally-scrollable row rather than wrapping or being clipped. Implement with `overflow-x: auto` on the board container and fixed-width, non-shrinking columns (`flex-shrink: 0`).

### 2.4 List/Table View (Tasks / Projects)
- Grouped by status, each group **collapsible** via chevron (To Do / Doing / Completed / On Hold)
- Table columns: `Task` (or `Projects`), `Priority`, `Members`, `Due Date`, `Actions`
- Members cell: single avatar, initials badge (e.g. "CN"), or `+` overflow avatar for multiple
- Row `...` opens row-level Actions menu
- **List / Board** toggle tab exists inside the Fields dropdown itself (not just a top-level switch)

### 2.5 Fields Customizer Dropdown
- Checkbox toggle list controlling visible columns/fields: `Priority`, `Members`, `Due Date`, `Labels`, `Status`, `Reporter`
- Persists independently per view (Board fields list ≠ List fields list, observed slightly different default toggles between the two)

### 2.6 Search
- Inline search input replacing page title area
- `⌘F` keyboard shortcut indicator shown in input
- Live-filters the currently grouped list (grouping/section headers persist, e.g. "To Do" remains visible with only matching rows)

### 2.7 Task Detail Page
- Header: title, description, lock icon, watcher count (eye icon + "1"), share icon, `...` menu, right-panel collapse toggle
- **Properties row:** assignee chip (avatar + role), due date chip
- **Labels row:** multiple label chips (Research, Design, Development, Testing, Deployment)
- **Resources:** "Add document or link..." input
- **Subtasks table:** Task, Priority, Members, Due Date, Actions + "+ Add Subtasks"
- **Comments:** avatar, author name, relative timestamp ("just now"), message body, reply input; separate top-level "Add a comment" input with attachment + send icon
- **Right panel — Details:**
  - Status (colored dot + label, e.g. "Backlog")
  - Priority (dropdown: No Priority / Urgent / High / Medium / Low, each with a colored bar-chart icon, single-select with checkmark)
  - Members, Dates (opens date range picker), Labels, Teams, Reporter
- **Right panel — Updates:** activity/audit log (e.g. "You changed priority from No priority to Urgent...", "You posted an update · Aug 2026")
- **Date range picker:** inline popover, `Jan 10 → End` fields, month navigator (`◀ January 2026 ▶`), calendar grid (Su–Sa), selected date shown as filled circle

### 2.8 Projects
- Same table pattern as Tasks, but column is `Lead` instead of `Members`
- Priority dropdown identical pattern (No Priority/Urgent/High/Medium/Low)
- Clicking a project drills into `Projects > [Project Name]` breadcrumb showing that project's own Tasks board/list (same board/list component, scoped by `projectId`)

### 2.9 Account Dropdown (click avatar/name in sidebar)
- Profile summary: avatar, name, email
- **Change Theme →** submenu: Light (checked) / Dark
- **Color Mode →** submenu: color swatches — Amber, Blue (active/checked), Pink, Rose, Emerald, Black
- **Settings** link → navigates to full settings page

### 2.10 Settings Page
- Left nav: **Profile** (active), **Theme**, **Color**, plus "← Back to app" and a settings search box
- **Profile form:** profile picture, Email (read display + edit pencil icon), Full Name input, Title input (placeholder "Designer"), Username input (placeholder "Dexuser")
- **Workspace access:** "Remove yourself from the workspace" with a destructive **Leave Workspace** button (red)

---

## 3. Frontend State Management Checklist

- `auth`: `{ user, authProvider: 'guest' | 'google', isAuthenticated }`
- `workspace`: `{ activeWorkspaceId, members[] }`
- `viewMode`: `'board' | 'list'` — tracked per page (Tasks, Projects)
- `visibleFields`: `Record<viewId, string[]>` — persisted per user per view (Board fields differ from List fields)
- `search`: `{ query, isOpen, debouncedQuery }`
- `filters`: `{ status[], priority[], members[], labels[], dueDateRange, reporter[], teams[] }`
- `collapsedGroups`: `string[]` — which status sections are collapsed in List view
- `taskDetail`: `{ selectedTaskId, isPanelOpen, isRightPanelCollapsed }`
- `dropdowns`: open/closed state per component instance — `fieldsDropdownOpen`, `filterDropdownOpen`, `priorityDropdownOpen`, `accountMenuOpen`, `themeSubmenuOpen`, `colorModeSubmenuOpen`
- `datePicker`: `{ isOpen, selectedStart, selectedEnd, visibleMonth }`
- `theme`: `'light' | 'dark'`
- `colorMode`: `'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black'`
- `profileForm`: `{ fullName, title, username, email, isDirty }`
- `kanbanDrag`: `{ draggedTaskId, draggedColumnId, sourceStatus, targetStatus, targetIndex }` (for both card DnD and column reorder) — confirmed via design review; card should show its drag-handle icon on hover, not always-on
- `boardScroll`: horizontal scroll position of the Kanban board container (columns are fixed-width and do not wrap — confirmed via design review)
- `commentDraft`: `{ taskId | subtaskId, body, parentCommentId }`

---

## 4. Derived Backend API & Database Schema

### 4.1 Database Entities

```
User
  id (uuid, pk)
  email (string, unique)
  fullName (string, nullable)
  title (string, nullable)
  username (string, nullable, unique)
  avatarUrl (string, nullable)
  authProvider (enum: guest, google)
  theme (enum: light, dark; default light)
  colorMode (enum: amber, blue, pink, rose, emerald, black; default blue)
  createdAt, updatedAt

Workspace
  id (uuid, pk)
  name (string)
  ownerId (fk -> User.id)
  createdAt, updatedAt

WorkspaceMember
  id (uuid, pk)
  workspaceId (fk -> Workspace.id)
  userId (fk -> User.id)
  role (enum: owner, admin, member)

Project
  id (uuid, pk)
  workspaceId (fk -> Workspace.id)
  name (string)
  leadId (fk -> User.id, nullable)
  priority (enum: no_priority, urgent, high, medium, low)
  dueDate (date, nullable)
  createdAt, updatedAt

Task
  id (uuid, pk)
  workspaceId (fk -> Workspace.id)
  projectId (fk -> Project.id, nullable)
  title (string)
  description (text, nullable)
  status (enum: backlog, todo, doing, completed, on_hold)
  priority (enum: no_priority, urgent, high, medium, low)
  reporterId (fk -> User.id)
  startDate (date, nullable)
  endDate (date, nullable)
  dueDate (date, nullable)
  position (float, for ordering within a column)
  createdAt, updatedAt

TaskAssignee (join table)
  taskId (fk -> Task.id)
  userId (fk -> User.id)

Label
  id (uuid, pk)
  workspaceId (fk -> Workspace.id)
  name (string)
  color (string)

TaskLabel (join table)
  taskId (fk -> Task.id)
  labelId (fk -> Label.id)

Subtask
  id (uuid, pk)
  taskId (fk -> Task.id)
  title (string)
  priority (enum, same as Task.priority)
  dueDate (date, nullable)
  position (float)

SubtaskAssignee (join table)
  subtaskId (fk -> Subtask.id)
  userId (fk -> User.id)

Comment
  id (uuid, pk)
  taskId (fk -> Task.id, nullable)
  subtaskId (fk -> Subtask.id, nullable)
  authorId (fk -> User.id)
  body (text)
  parentCommentId (fk -> Comment.id, nullable — for reply threading)
  createdAt

Resource
  id (uuid, pk)
  taskId (fk -> Task.id)
  type (enum: link, document)
  url (string)
  title (string, nullable)

ActivityLog
  id (uuid, pk)
  taskId (fk -> Task.id)
  userId (fk -> User.id)
  action (string, e.g. "changed_priority", "posted_update")
  fromValue (string, nullable)
  toValue (string, nullable)
  createdAt

Team
  id (uuid, pk)
  workspaceId (fk -> Workspace.id)
  name (string)

TeamMember (join table)
  teamId (fk -> Team.id)
  userId (fk -> User.id)

ViewPreference
  id (uuid, pk)
  userId (fk -> User.id)
  viewKey (string, e.g. "tasks-board", "tasks-list", "projects-list")
  visibleFields (jsonb, array of field keys)
  viewMode (enum: board, list)
```

### 4.2 Required REST API Endpoints

**Auth**
- `POST /auth/guest` — create/continue guest session
- `POST /auth/google` — OAuth login
- `POST /auth/logout`
- `GET /auth/me`

**Workspaces**
- `GET /workspaces`
- `POST /workspaces`
- `GET /workspaces/:id`
- `DELETE /workspaces/:id/members/me` — "Leave Workspace"

**Projects**
- `GET /workspaces/:id/projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

**Tasks**
- `GET /projects/:id/tasks` or `GET /workspaces/:id/tasks` — supports `?status=&priority=&assignee=&label=&search=`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id` — title, description, status, priority, dates
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/reorder` — position + status column change (drag-and-drop)
- `POST /tasks/:id/assignees` / `DELETE /tasks/:id/assignees/:userId`
- `POST /tasks/:id/labels` / `DELETE /tasks/:id/labels/:labelId`
- `POST /tasks/:id/resources`
- `GET /tasks/:id/activity`

**Subtasks**
- `POST /tasks/:id/subtasks`
- `PATCH /subtasks/:id`
- `DELETE /subtasks/:id`

**Comments**
- `GET /tasks/:id/comments`
- `POST /tasks/:id/comments`
- `POST /comments/:id/replies`

**Search**
- `GET /search?q=&scope=tasks|projects&workspaceId=`

**User Preferences**
- `GET /users/me/view-preferences?view=tasks-board`
- `PUT /users/me/view-preferences`
- `PATCH /users/me` — fullName, title, username
- `PATCH /users/me/theme`
- `PATCH /users/me/color-mode`

---

## Design Review Notes (from Figma comment threads)
- **Drag-and-drop:** Confirmed required. The six-dot icon on cards is the drag handle; it should appear/highlight on hover rather than sit static at full opacity, per reviewer feedback.
- **Horizontal scroll:** Confirmed required. The board (To Do / Doing / Completed / On Hold, extendable) scrolls horizontally rather than wrapping columns.

## Notes / Open Questions Worth Confirming Against the Actual Figma File
- Exact hex values above are visual estimates from screenshots, not extracted via Figma's color picker (only the login frame's `#FFFFFF` background was explicitly labeled in the panel). Worth pulling exact values directly from Figma's Inspect panel if pixel-perfect fidelity matters for the assessment.
- The `Blue` swatch in Color Mode renders visually purple — confirm intended hex.
- No explicit hover/focus states were visible in static screenshots (e.g. button hover color, input focus ring) — recommend a sensible default (subtle darken/border-color-shift) unless the file has hover variants you can inspect directly.