# Batch 9: Admin Dashboard & Analytics

## 1. Introduction
**Title:** Admin Dashboard & Analytics
**Slug:** batch-9-admin-dashboard-analytics
**Description:** This batch focuses on providing platform oversight for Admins and data insights for Employers. It introduces a Super Admin Panel for user and content management, and an Employer Analytics dashboard to track job performance.
**Goals:**
- **Employer Insights:** Provide employers with key metrics (Active Jobs, Applicants, Pending Applications) to monitor their hiring pipeline.
- **Platform Oversight:** Empower Admins to view all users and jobs, and perform moderation actions (Ban User, Delete Job).
- **System Health & Logs:** Implement a comprehensive logging system accessible to users (own logs) and Admins (all logs).
- **Data Visualization:** Provide visual analytics (charts/graphs) for Admins to track platform growth and revenue.
- **Scientist Motivation:** Revamp the Scientist Dashboard with encouraging metrics and progress trackers.

## 2. User Stories & Acceptance Criteria

### 2.1 Employer Analytics Dashboard
**As an Employer, I want to see a high-level overview of my hiring activities so that I can track my progress.**

*   **GIVEN** I am logged in as an Employer
*   **WHEN** I visit my dashboard (`/employer/dashboard`)
*   **THEN** I should see a set of "Stats Cards" at the top of the page.
*   **AND** the cards should display:
    *   Total Active Jobs
    *   Total Applicants (across all jobs)
    *   Pending Applications
    *   (Optional) Total Hired
*   **AND** the design should match the "Stats Card" style from `wowdash/index-10.html` (gradient background, icon, percentage change if available).

### 2.2 Super Admin User Management
**As a Super Admin, I want to view and manage all users on the platform so that I can moderate the community.**

*   **GIVEN** I am logged in as a user with the `ADMIN` role
*   **WHEN** I visit the Admin Users page (`/admin/users`)
*   **THEN** I should see a table listing all registered users (Scientists, Employers, Collaborators).
*   **AND** I should see columns for Name, Email, Role, Status (Active/Banned), and Joined Date.
*   **WHEN** I click a "Ban" action on a user row
*   **THEN** the user's status should update to "BANNED" and they should be prevented from logging in (or accessing protected routes).

### 2.3 Super Admin Job Management
**As a Super Admin, I want to view and manage all job postings so that I can remove inappropriate content.**

*   **GIVEN** I am logged in as an `ADMIN`
*   **WHEN** I visit the Admin Jobs page (`/admin/jobs`)
*   **THEN** I should see a table listing all jobs from all employers.
*   **WHEN** I click "Delete" on a job
*   **THEN** the job should be removed (or soft-deleted) from the platform.

### 2.4 System Logs & Audit Trail
**As a User, I want to see a history of my account activities so that I can track my actions.**
**As an Admin, I want to see all system logs so that I can audit platform usage and debug issues.**

*   **GIVEN** I am logged in as any user
*   **WHEN** I visit my settings or activity log page
*   **THEN** I should see a list of my recent actions (Login, Updated Profile, Applied to Job).
*   **GIVEN** I am logged in as an `ADMIN`
*   **WHEN** I visit the Admin Logs page
*   **THEN** I should see a filterable list of ALL system logs (by User, Action Type, Status, Date).
*   **THEN** I should see a filterable list of ALL system logs (by User, Action Type, Status, Date).
*   **AND** the system must log **ALL** user and system actions, including but not limited to:
    *   **Auth:** Login, Signup, Password Reset, Session Refresh.
    *   **Jobs:** Post, Edit, Delete, Change Status.
    *   **Applications:** Apply, Shortlist, Reject, Hire.
    *   **Projects:** Create, Update, Archive, Add/Remove Collaborator.
    *   **Tasks:** Create, Move (Kanban), Edit, Delete, Complete.
    *   **Files:** Upload, Delete.
    *   **Payments:** Fund, Release, Payout, Refund.
    *   **Profile:** Update Details, Upload CV/Avatar.

### 2.5 Admin Dashboard Analytics
**As an Admin, I want to see visual charts of platform performance so that I can make data-driven decisions.**

*   **GIVEN** I am logged in as an `ADMIN`
*   **WHEN** I visit the Admin Dashboard
*   **THEN** I should see:
    *   **Revenue Chart:** Area chart showing Income vs. Payouts over time (ref `index.html` #chart).
    *   **User Distribution:** Donut chart showing Scientists vs. Employers vs. Collaborators (ref `index.html` #userOverviewDonutChart).
    *   **Stats Cards:** Total Users, Total Jobs, Total Revenue (using `index-10.html` style).

### 2.6 Scientist Dashboard Improvements
**As a Scientist, I want to see encouraging metrics and progress so that I feel motivated to apply.**

*   **GIVEN** I am logged in as a `SCIENTIST`
*   **WHEN** I visit my Dashboard
*   **THEN** I should see:
    *   **Financial Overview:**
        *   **Total Earned:** Sum of payments with status `RELEASED`.
        *   **Potential Earnings:** Sum of payments with status `FUNDED` (Escrow) or `PENDING`.
    *   **Work Stats:**
        *   **Jobs Completed:** Count of projects where status is `COMPLETED`.
        *   **Ongoing Projects:** A list of projects where status is `ACTIVE`.
    *   **Profile Completion:** A progress bar indicating how complete my profile is (ref `index.html` progress bars).
    *   **Activity Stats:** Cards for "Applications Sent", "Profile Views" (mock or real), "Shortlisted".
    *   **Recent Activity:** A clean list of recent application updates.

### 2.7 Enhanced Notifications
**As a User, I want to see visual context (profile pics, icons) in my notifications so that I can quickly identify the source and type of activity.**

*   **GIVEN** I receive a notification (toast, dropdown, or list view)
*   **THEN** the notification should display a visual indicator based on the source:
    *   **User Action:** If triggered by a user (e.g., "John added a task"), display that user's **Profile Picture**.
    *   **System/Custom Action:** If a specific system event (e.g., "Payment Released"), display a relevant **Custom Icon** (SVG/HTML).
    *   **Fallback:** If no specific visual is provided in metadata, display the default **Bell Icon**.
*   **AND** the `Notification` model's `metadata` field will store:
    *   `visual_type`: `'image'` | `'icon'`
    *   `visual_resource`: URL (for image) or Icon Name/SVG String (for icon).

## 3. UX/UI References
*   **Stats Cards:** Use the design from `authesci-app/templates/wowdash/src/html/pages/index-10.html`.
    *   **Visuals:** Gradient backgrounds (Cyan, Purple, Success, Warning), white text/icons, "glassmorphism" feel.
*   **Charts:**
    *   **Area Chart:** Use the "Sales Statistic" chart style from `index.html` (ApexCharts) for Revenue.
    *   **Donut Chart:** Use the "Users Overview" chart style from `index.html` for User Roles.
*   **Progress Bars:** Use the "Top Countries" progress bar style from `index.html` for Scientist Profile Completion.
*   **Tables:** Use the standard WowDash table styles.

## 4. Data Model Changes

### Prisma Schema Updates
We need a robust `Log` model to track all system activities.

```prisma
// prisma/schema.prisma

model Log {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String   // e.g., "LOGIN", "JOB_APPLY", "PAYMENT_SUCCESS", "PAYMENT_FAILURE"
  status    String   // "SUCCESS", "FAILURE", "WARNING"
  level     String   // "INFO", "WARN", "ERROR"
  message   String
  metadata  Json?    // Context: IP address, error stack, payment ref, etc.
  createdAt DateTime @default(now()) @map("created_at")

  user      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("logs")
}

// Update Profile to support banning
model Profile {
  // ... existing fields
  isBanned Boolean @default(false) @map("is_banned")
  logs     Log[]
}
```

## 5. Components & Implementation Plan

### 5.1 Components
*   **Server Components:**
    *   `StatsWidget.tsx`: Fetches counts for cards.
    *   `AdminUserTable.tsx`, `AdminJobTable.tsx`.
    *   `LogViewer.tsx`: Reusable component to list logs (accepts `userId` prop for personal view, or null for admin view).
    *   `AdminCharts.tsx`: Fetches data for Area and Donut charts.
    *   `AdminCharts.tsx`: Fetches data for Area and Donut charts.
    *   `ScientistProgress.tsx`: Calculates and displays profile completion.
    *   `ScientistFinanceWidget.tsx`: Displays Earned vs Potential earnings.
    *   `OngoingProjectsList.tsx`: Lists active projects for the scientist.
*   **Client Components:**
    *   `StatsCard.tsx`: UI for stats.
    *   `ApexChartWrapper.tsx`: Client wrapper for `react-apexcharts`.
    *   `UserActionMenu.tsx`, `JobActionMenu.tsx`.

### 5.2 Implementation Steps
1.  **Database:**
    *   Update `prisma/schema.prisma` with `Log` and `Profile.isBanned`.
    *   Run `npx prisma migrate dev`.
2.  **Logging Infrastructure:**
    *   Create `lib/logger.ts` with `logActivity(userId, action, status, message, metadata)`.
    *   **Crucial:** Add `logActivity` calls to **ALL** server actions and API routes to ensure complete coverage (Tasks, Projects, Files, Auth, Payments, etc.).
4.  **Enhanced Notifications:**
    *   Update `createNotification` utility to accept optional `visualType` and `visualResource`.
    *   Update Notification UI components (`NotificationItem`, `NotificationPage`) to:
        *   Check `metadata.visual_type`.
        *   If `'image'`, render `<img>` with `metadata.visual_resource`.
        *   If `'icon'`, render the Icon component/SVG specified in `metadata.visual_resource`.
        *   Else, render default Bell icon.
3.  **Admin Dashboard:**
    *   Implement `app/admin/page.tsx` with Stats Cards and Charts.
    *   Implement `app/admin/logs/page.tsx` using `LogViewer`.
4.  **Scientist Dashboard:**
    *   Update `app/scientist/dashboard/page.tsx`.
    *   Add "Profile Completion" progress bar.
    *   Add "Financial Overview" cards (Earned/Potential).
    *   Add "Ongoing Projects" list.
    *   Add "My Activity" section using `LogViewer` (filtered to current user).
5.  **Admin Features:**
    *   Implement User/Job management pages.

## 6. MCP Tools & Resources
*   **supabase:** Use `supabase` MCP to verify the new schema changes (check `system_logs` table creation).
*   **context7:** Use `context7` to fetch documentation for `react-apexcharts` if complex charting is added later.

## 7. Risks & Dependencies
*   **Dependency:** Depends on Batch 8 (Notifications) being stable, as Admin actions might trigger notifications.
*   **Risk:** "Banning" a user might have cascading effects (e.g., what happens to their active jobs or applications?). *Mitigation:* For MVP, just prevent login. Future batches can handle cleanup.
