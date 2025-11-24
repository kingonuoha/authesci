# Batch 6 Review Guide

## 1. Quick Start
To test the Project Workspace features:
1.  **Login as Employer**: Use a test account (e.g., `employer@example.com`).
2.  **Go to Dashboard**: Navigate to `/employer/dashboard`.
3.  **Find an Application**: Go to a Job with applicants.
4.  **Hire**: Click "Accept" on an application.
5.  **Enter Workspace**: Click the new "Project" link in the dashboard or notification.

## 2. Test Accounts & Data
-   **Employer**: `employer@test.com` / `password123`
-   **Scientist**: `scientist@test.com` / `password123`
-   **Job**: "Senior Bio-Researcher" (ID: `job-123`)
-   **Application**: Scientist applied to Job 123.

## 3. Test Cases

### TC-6.1: Project Auto-Creation
-   **Step**: Login as Employer -> Accept an application.
-   **Expected**:
    -   Toast notification: "Project Created".
    -   Redirects to `/project/[projectId]`.
    -   Database: New `Project` record exists with correct `creatorId`.
    -   Database: Two `Collaborator` records exist (Employer & Scientist).

### TC-6.2: Kanban Board Functionality
-   **Step**: In Project Workspace -> Kanban Tab.
-   **Action**: Click "Add Task" button.
-   **Expected**: Modal opens.
-   **Action**: Fill Title, Description, Due Date -> Click Save.
-   **Expected**: Modal closes, new task appears in "To Do" column.
-   **Action**: Drag "Literature Review" to "In Progress".
-   **Expected**: Card snaps to new column. Database updates `status` to `IN_PROGRESS`.

### TC-6.3: Realtime Sync & Presence
-   **Step**: Open the same Project in two different browsers (or Incognito).
    -   Browser A: Employer
    -   Browser B: Scientist
-   **Expected**: Both browsers show the other user's avatar/cursor in the "Online" list.
-   **Action**: Employer moves task to "Done".
-   **Expected**: Scientist's screen updates instantly without refresh.

### TC-6.4: File Upload
-   **Step**: In Project Workspace -> Documents Tab.
-   **Action**: Click "Upload" -> Select a PDF.
-   **Expected**:
    -   Upload progress bar shows.
    -   File appears in the list with correct name/size.
    -   Clicking the file opens/downloads it.

### TC-6.5: Access Control (Security)
-   **Step**: Login as a *different* Scientist (not part of the project).
-   **Action**: Try to access `/project/[projectId]`.
-   **Expected**: Redirect to 404 or Dashboard with "Unauthorized" error.

## 4. Edge Cases
-   **Network Drop**: Drag a task while offline -> Should revert to original position or show error.
-   **Large Files**: Upload a >50MB file -> Should show "File too large" error (if limited) or handle gracefully.
-   **Concurrent Edits**: Two users moving the same task -> Last write wins (Realtime should sync eventual state).

## 5. Accessibility Checks
-   [ ] **Keyboard Navigation**: Can tab through Kanban columns and tasks?
-   [ ] **Drag via Keyboard**: Does `@dnd-kit` support Space/Arrow keys for moving items?
-   [ ] **Screen Readers**: Are column headers and task titles announced?
