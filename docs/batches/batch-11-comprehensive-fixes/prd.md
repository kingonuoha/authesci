# Batch 11: Comprehensive Fixes & Enhancements

## 1. Overview
This batch focuses on addressing critical fixes, usability improvements, and missing features identified during the QA phase. It covers a wide range of modules including Admin, Authentication, Job Marketplace, and Project Workspace.

**Goal:** Stabilize the application, improve user experience, and ensure all core workflows are fully functional and polished.

## 2. Feature Requirements

### 2.1 Admin Dashboard Improvements
*   **System Logs Integration:**
    *   Move System Logs to be a tab within the Notifications page/section for better accessibility.
    *   **Action:** Ensure `logActivity` (from `lib/logger.ts`) is implemented across *all* critical actions (Create, Update, Delete) to provide a comprehensive audit trail.
*   **Analytics & Stats:**
    *   **Fix:** Ensure Admin Analytics and Stats widgets are correctly fetching and displaying data on the dashboard. Debug current data aggregation logic.
*   **User & Job Management:**
    *   **UI Update:** Convert Admin Job lists and Managed Users lists to a **Card** format for better readability and consistency with the rest of the app.
    *   **Create Admin:** Add a button/functionality in the Users list to promote a user to Admin or create a new Admin account directly.
*   **Payroll & Payouts:**
    *   **New Feature:** Implement a "Payroll" or "Payouts" section for Admins.
    *   **Functionality:** Admins need to view pending payouts (from Escrow release) and mark them as "Processed" after manual transfer.

### 2.2 Authentication & Onboarding
*   **Role Selection UI:**
    *   **Enhancement:** On the Sign-Up page, when selecting a role (Scientist, Employer), display a brief card description explaining what each role can do.
*   **Registration Flow Fix:**
    *   **Bug Fix:** Resolve the 404 error occurring after registration redirection to `auth/verified-email`. Ensure the route exists and handles the state correctly.

### 2.3 Job Marketplace Enhancements
*   **Job Index:**
    *   **UI:** Display the number of **Applicants** on each Job Card in the main index page.
*   **Notifications:**
    *   **New Job Alert:** Automatically send an email notification to all registered Scientists when a new Job is posted and paid for. *Ref: Use the existing Notification System architecture (Tip #3 in `ai-development-tips.md`).*
*   **Screening Questions:**
    *   **Employer Feature:** Allow Employers to add custom screening questions when creating or editing a Job.
    *   **Applicant Flow:** Require Applicants to answer these questions when applying.
*   **Employer Dashboard:**
    *   **Recent Applications:** Display as **Cards**.
    *   **Actions:** Add a "View All" button.
    *   **Interaction:** Add a **Chat Icon** on each applicant card to initiate a direct message.

### 2.4 Project Workspace & Collaboration
*   **Collaborator Invitation:**
    *   **Feature:** Add an "Invite" button to Active Projects.
    *   **Flow:** Opens a modal -> User pastes email (disable auto-suggest) -> System sends email invite with link.
    *   **Acceptance:** On clicking the link, the user joins the project as a **Collaborator**.
    *   **Validation:** If the email is not found in the system, show an error and a card stating "User must have an Authesci account".
*   **Activity Log:**
    *   **Feature:** Implement a "Recent Activity" log within the Active Projects view to track file uploads, task changes, etc.

### 2.5 Global UI/UX & Chat
*   **Universal Online Status:**
    *   **Component:** Create a dedicated `UserAvatar` component that includes an online status indicator (green dot).
    *   **Implementation:** Use Supabase Realtime Presence to track user status. Apply this globally wherever a user profile photo is shown.
*   **Chat Improvements:**
    *   **Sidebar:** Add a "Chat" entry to the main sidebar for quick access.
    *   **Sorting:** Ensure the first 5 messages are shown in previews. Unread conversations should float to the top.
*   **Dynamic Carousel (Featured Skills/Categories):**
    *   **Feature:** Add a carousel to both Scientist and Employer dashboards displaying categories/skills.
    *   **Images:** Fetch dynamic images using the **Pexels API** (API Key available).
*   **Footer:**
    *   **Update:** Ensure the footer displays the current year dynamically.
*   **Pagination / Lazy Loading:**
    *   **Requirement:** Implement Pagination or Infinite Scroll for all lists that are expected to grow (Jobs, Users, Applications, Logs).

## 3. Technical Implementation Notes

### 3.1 Pexels API Integration
*   Create a utility service `lib/services/pexels.ts` to fetch images.
*   Cache results where possible to avoid hitting rate limits.

### 3.2 Realtime Features (Chat & Status)
*   **Reference:** See **Tip #7** in `docs/ai-development-tips.md`.
*   **Presence:** Use `supabase.channel('online-users')` for tracking presence state.
*   **Chat:** Ensure `snake_case` (DB) to `camelCase` (Frontend) mapping is handled correctly for real-time payloads.

### 3.3 Email Notifications
*   **Reference:** See **Tip #3** in `docs/ai-development-tips.md`.
*   **Batching:** If the number of scientists grows large, consider using a queue for the "New Job" email blast to avoid timeouts.

### 3.4 Database Updates
*   **Job Model:** Add field for `screeningQuestions` (Json).
*   **Application Model:** Add field for `screeningAnswers` (Json).
*   **Project Model:** Ensure `collaborators` relation is correctly set up for the invite flow.

## 4. Acceptance Criteria
*   [ ] Admin can view logs in the Notification tab and see analytics data.
*   [ ] Admin can manage payouts and promote users.
*   [ ] Registration flow completes without 404 errors.
*   [ ] Employers can add screening questions and see applicant cards with chat options.
*   [ ] Scientists receive emails for new jobs.
*   [ ] Project invites work for existing users; error shown for non-users.
*   [ ] Online status is visible globally on avatars.
*   [ ] Dashboards feature a dynamic Pexels-powered carousel.
*   [ ] All long lists have pagination or infinite scroll.

## 5. UI Reference & Templates
The following HTML templates from `wowdash-tailwind-admin/src/html/pages` should be used as the source of truth for component design and structure:

| Feature | Template File | Notes |
| :--- | :--- | :--- |
| **User & Job Cards** | `users-grid.html` | Use the grid layout for Admin User/Job lists and Employer Applicant views. |
| **Chat Interface** | `chat-message.html` | Reference for the message bubbles, input area, and sidebar styling. |
| **Carousel** | `carousel.html` | Use for the "Featured Skills/Categories" widget. |
| **Pagination** | `pagination.html` | Standard pagination styles for lists. |
| **Activity Log** | `widgets.html` | Check for timeline/activity widgets here. |
| **General Dashboard** | `index.html` - `index-14.html` | Reference these for general dashboard layout patterns and widget arrangements. |

