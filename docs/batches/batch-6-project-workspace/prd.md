# Batch 6: Project Workspace (Kanban & Collaboration)

## 1. Overview
**Goal**: Implement the private workspace where actual work happens after a Scientist is hired. This covers the "Project Foundation" and "Task Management" requirements.

**Context**: Once a job application is accepted, the system must transition from the "hiring" phase to the "working" phase. This involves creating a dedicated project space, populating it with members, and providing tools for task management (Kanban) and file sharing.

## 2. Goals & Metrics
- **Primary Goal**: Enable seamless collaboration between Employer and Scientist via a shared workspace.
- **Key Metrics**:
    - Time from "Hired" to "First Task Created".
    - Number of active tasks per project.
    - Number of files uploaded per project.

## 3. User Flow
1.  **Transition**: Employer marks an Application as "ACCEPTED" -> System automatically creates a `Project` and adds both Employer and Scientist as `Collaborators`.
2.  **Access**: Both users see the new project in their dashboard (under "My Projects").
3.  **Workspace**:
    -   **Kanban Board**: Users can create tasks via a modal, drag them between columns (To Do, In Progress, Done), and assign them.
    -   **Realtime Cursors**: Users can see who else is currently viewing the board (Supabase Presence).
    -   **Documents**: Users can upload files (PDF, CSV, etc.) which are stored in Cloudflare R2 and listed in the workspace.
    -   **Chat/Activity**: (Optional/Future) Real-time updates on project activity.

## 4. Acceptance Criteria

### GIVEN a Job Application is "ACCEPTED"
-   **WHEN** the status change is saved
-   **THEN** a new `Project` record is created.
-   **AND** the Employer is added as a `Collaborator` (Owner/Admin).
-   **AND** the Scientist is added as a `Collaborator` (Member).
-   **AND** the Job status is updated to "CLOSED" (or remains active if multiple hires are allowed - *Decision: For MVP, assume 1 hire per job -> CLOSED*).

### GIVEN a Project Workspace
-   **WHEN** a user visits the Kanban tab
-   **THEN** they see three columns: "To Do", "In Progress", "Done".
-   **AND** they see the avatars/cursors of other online members.
-   **WHEN** they click "Add Task"
-   **THEN** a modal opens to enter Title, Description, Due Date, and Priority.
-   **WHEN** they save the task
-   **THEN** it appears in the "To Do" column immediately for all users.
-   **WHEN** they drag a task from "To Do" to "In Progress"
-   **THEN** the task status updates in the database.
-   **AND** the change is reflected in real-time for other users (via Supabase Realtime).

### GIVEN the Documents Tab
-   **WHEN** a user uploads a file
-   **THEN** the file is uploaded to Cloudflare R2 via a presigned URL.
-   **AND** a `ProjectFile` record is created.
-   **AND** the file appears in the list.

## 5. Tech Stack & Tools
-   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Shadcn/UI.
-   **Kanban**: `@dnd-kit/core` (for drag-and-drop), `@dnd-kit/sortable`.
-   **State/Sync**: Supabase Realtime (for Kanban updates & Presence/Cursors).
-   **Storage**: Cloudflare R2 (via S3 compatible SDK).
-   **Database**: Prisma + Supabase PostgreSQL.
-   **Template Reference**: `authesci-app/templates/wowdash/src/html/pages/kanban.html`
    -   Use classes: `.kanban-wrapper`, `.kanban-item`, `.kanban-card`, `.connectedSortable`.
    -   Refer to the "Add Task" modal structure in the template.

## 6. Data Model Changes
*Note: The schema already supports these features. No new migrations expected unless fields are missing.*

```prisma
// Existing models relevant to this batch
model Project {
  id           String         @id @default(uuid())
  status       ProjectStatus  @default(ACTIVE)
  collaborators Collaborator[]
  tasks        Task[]
  files        ProjectFile[]
  // ...
}

model Task {
  id          String     @id @default(uuid())
  projectId   String
  status      TaskStatus @default(OPEN) // Maps to "To Do"
  // ...
}

model ProjectFile {
  id          String   @id @default(uuid())
  fileUrl     String
  // ...
}
```

## 7. Implementation Plan

### Phase 1: Project Creation Logic
-   [ ] Create `createProjectFromApplication` service function.
-   [ ] Hook into `updateApplicationStatus` server action to trigger project creation on "ACCEPTED".

### Phase 2: Workspace Layout & Routing
-   [ ] Create `app/project/[projectId]/layout.tsx` (Protected, checks `Collaborator` access).
-   [ ] Create `app/project/[projectId]/page.tsx` (Dashboard/Overview).

### Phase 3: Kanban Board
-   [ ] Install `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities`.
-   [ ] Create `KanbanBoard` component.
-   [ ] Create `KanbanColumn` and `KanbanCard` components.
-   [ ] Implement `updateTaskStatus` server action.
-   [ ] Integrate Supabase Realtime for live updates.

### Phase 4: File Management
-   [ ] Implement R2 upload API route (`api/upload/presigned-url`).
-   [ ] Create `FileManager` component (List + Upload button).
-   [ ] Implement `uploadFile` server action (to save metadata to DB).

## 8. MCP Tools & Resources
-   **supabase**: Use to verify Realtime subscriptions and check RLS policies for `Project` and `Task` access.
-   **context7**: Use to fetch documentation for `@dnd-kit` if complex drag-and-drop logic is needed.
