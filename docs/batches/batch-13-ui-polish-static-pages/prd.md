# Product Requirements Document (PRD) - Batch 13: UI Polish & Static Pages

## 1. Overview
**Title:** UI Polish & Static Pages (In-Lab Preview, Loading States, Responsiveness)
**Batch:** 13
**Estimated Duration:** 2 Days

This batch focuses on refining the user experience by adding "premium" polish to the application. It addresses the "In-Lab" mode (a future feature) by creating a hype/preview page, ensures the application handles loading and error states gracefully with skeleton screens and custom error pages, and guarantees mobile responsiveness for critical navigation and data tables.

## 2. Goals & Success Metrics
### Goals
1.  **Generate Demand:** Capture user interest for the upcoming "In-Lab" feature via a "Coming Soon" page.
2.  **Enhance UX Perception:** Eliminate layout shifts and "jank" using proper loading skeletons.
3.  **Improve Trust:** Replace generic 404/500 errors with branded, helpful error pages.
4.  **Mobile Readiness:** Ensure the sidebar and data tables function seamlessly on mobile devices.

### Success Metrics
-   **In-Lab Signups:** User can successfully submit their email to the "Notify Me" form (saved to `Subscription` table).
-   **Visual Stability:** Cumulative Layout Shift (CLS) score < 0.1 on dashboard pages.
-   **Mobile Usability:** Sidebar opens/closes correctly on mobile; tables are horizontally scrollable without breaking layout.

## 3. User Stories & Acceptance Criteria

### 3.1 In-Lab Mode (Coming Soon)
**Story:** As a user, I want to see a preview of the "In-Lab" feature so I can understand upcoming capabilities and sign up for updates.

*   **GIVEN** an authenticated user clicks the "In-Lab" navigation link
*   **WHEN** the page loads
*   **THEN** they see a "Coming Soon" landing page with a feature teaser.
*   **WHEN** they click "Notify Me" (after verifying their email is pre-filled or entered)
*   **THEN** their email is saved to the records and they receive a success toast.

### 3.2 Loading States (Skeletons)
**Story:** As a user, I want to see a loading placeholder while data is fetching so that the interface feels responsive and doesn't jump around.

*   **GIVEN** a dashboard widget (e.g., Job List, Kanban Board) is fetching data
*   **WHEN** the data is loading
*   **THEN** a Shimmer/Skeleton component matching the widget's layout is displayed.
*   **WHEN** data arrives
*   **THEN** the skeleton fades out and real content replaces it instantly.

### 3.3 Custom Error Pages
**Story:** As a user, I want helpful options if I hit a broken link or system error.

*   **GIVEN** a user navigates to a non-existent URL
*   **THEN** the custom branded 404 page is shown with a button to "Go Home".
*   **GIVEN** a server-side exception occurs
*   **THEN** the custom branded 500 page is shown with a "Try Again" button.

### 3.4 Mobile Responsiveness
**Story:** As a mobile user, I want to access the menu and view data tables without zooming or horizontal scrolling issues.

*   **GIVEN** I am on a mobile device (< 768px)
*   **WHEN** I tap the "Menu" hamburger icon
*   **THEN** the sidebar opens as a Sheet/Drawer overlay.
*   **WHEN** I view a wide table (e.g., Applications List)
*   **THEN** the table container scrolls horizontally while the page body remains fixed.

## 4. UX & Design References
*   **In-Lab Page:** Inspiration from `sign-in.html` (centered card) or a dedicated section in `index.html`. Clean, minimalist, high-impact typography.
*   **Skeletons:** Match the exact layout of the component (e.g., `JobCard`, `KanbanColumn`). Use `shadcn/ui` Skeleton primitive.
*   **Error Pages:** Reference `error.html` from WowDash template.
*   **Reference Directory:** `authesci-app/templates/wowdash/src/html/pages/`

## 5. Data Model Changes
No new tables required. We will leverage the existing **Subscription** model for the "In-Lab" waitlist.

```prisma
// Reference only - No changes needed if this exists
model Subscription {
  id        String   @id @default(uuid())
  email     String   @unique
  source    String?  // We will store "IN_LAB_WAITLIST" here
  createdAt DateTime @default(now()) @map("created_at")

  @@map("subscriptions")
}
```

## 6. Component Checklist

### static-pages/
- [ ] `app/(app)/in-lab/page.tsx` (Server Component - The landing page)
- [ ] `components/modules/public/InLabWaitlistForm.tsx` (Client Component - "Notify Me" action)
- [ ] `app/not-found.tsx` (Global 404 Page)
- [ ] `app/error.tsx` (Global Error Boundary)
- [ ] `app/global-error.tsx` (Root Error Boundary)

### ui/ (Polish)
- [ ] `components/ui/skeleton.tsx` (Ensure standard Shadcn skeleton is present)
- [ ] `components/modules/loaders/DashboardSkeleton.tsx`
- [ ] `components/modules/loaders/KanbanSkeleton.tsx`
- [ ] `components/modules/loaders/JobCardSkeleton.tsx`

### layout/
- [ ] `components/modules/MobileSidebar.tsx` (Sheet-based sidebar for mobile)
- [ ] Refactor `Sidebar.tsx` to hide on mobile / toggle via state.

## 7. Implementation Plan

1.  **In-Lab Page:**
    *   Create route `app/(app)/in-lab/page.tsx`.
    *   Implement `InLabWaitlistForm` using a Server Action `subscribeToWaitlist(formData)`.
    *   Action: Upsert into `Subscription` table with `source: "IN_LAB_WAITLIST"`.

2.  **Error Handling:**
    *   Create `not-found.tsx` in `app/`. Style using `error.html` inspiration.
    *   Create `error.tsx` in `app/(app)/` to catch dashboard errors.

3.  **Loading Skeletons:**
    *   Identify "Suspense" boundaries in existing layouts.
    *   Create `loading.tsx` files in `app/(app)/dashboard/`, `app/(app)/jobs/`, etc.
    *   Build specific skeleton components that mimic the live data views.

4.  **Mobile Sidebar:**
    *   Update `app/(app)/layout.tsx` to include a mobile trigger (Hamburger menu) visible only on small screens.
    *   Use `Sheet` from Shadcn/UI to render the sidebar content on mobile.

5.  **Table Responsiveness:**
    *   Wrap all `Table` components in a `div` with `className="overflow-x-auto"`.

## 8. MCP Tools & Resources
*   **vibe-check-mcp-server:** Run this **after** implementing the static pages to ensure they match the "Premium" aesthetic and have no visual bugs.
*   **playwright:** Use to verify the "Notify Me" form submission and mobile sidebar toggle.
*   **supabase:** Verify `Subscription` table entries are created correctly.

## 9. Risks & Dependencies
*   **Risk:** `loading.tsx` files can sometimes conflict if nested too deeply or if Server Components stream data unexpectedly. **Mitigation:** Test each route individually with "Slow 3G" network throttling in DevTools.
*   **Dependency:** Ensure `Subscription` model is migrated (Batch 1 check).
