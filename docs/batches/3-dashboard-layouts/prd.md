# 🧭 Batch 3: Dashboard Layouts & Navigation - PRD

| | |
| --- | --- |
| **Batch ID** | 3 |
| **Version** | 1.0 |
| **Status** | Ready to Start |
| **Prerequisites** | Batch 1.5 (Component Library), Batch 2 (Authentication) |
| **Duration** | 1.5 days |

---

## 1. Overview

This batch focuses on creating the primary application shell that all authenticated users will interact with. It establishes the main dashboard layout, including a role-aware sidebar and a persistent header. This work is critical as it provides the foundational structure for all subsequent features, ensuring a consistent user experience and a logical, protected routing system for each user role (Scientist, Employer, etc.).

### Problem It Solves

-   **No Unified UI Shell:** After login, users land on placeholder pages with no consistent navigation or structure.
-   **Role-Based Features Are Inaccessible:** There is no mechanism to display different navigation options to different user roles.
-   **Inconsistent Page Protection:** While the middleware protects routes, the UI layout itself doesn't visually enforce role separation.

### Who It's For

-   **End-Users:** All authenticated users (Scientists, Employers, Collaborators, Admins) who need a coherent and navigable interface.
-   **Feature Developers:** Developers working on Batches 4-10 who will build their features *within* this established layout.

### Why It's Valuable

-   **Consistent User Experience:** Provides a predictable and professional UI shell across the entire application.
-   **Accelerated Development:** Creates a clear structure (`layout.tsx`) where future developers can simply add their page content without rebuilding the shell.
-   **Enhanced Security & UX:** The layout will visually and structurally reinforce the role-based access control (RBAC) implemented in the middleware.

---

## 2. Core Features

### Feature 1: Role-Specific Root Layouts

**What it does:** Implements a `layout.tsx` file within each role's top-level directory (e.g., `authesci-app/app/employer/layout.tsx`). This layout will act as the gatekeeper and structural provider for all pages within that role's section.

**How it works:**
1.  The `layout.tsx` will be a Server Component.
2.  It will immediately call the `getAuthenticatedUser()` service from `lib/services/auth-service.ts`.
3.  This service call will specify the `allowedRoles` for that section (e.g., `['EMPLOYER', 'ADMIN']` for the employer layout). The service handles the redirection of unauthorized users.
4.  On success, it receives the `user` and `profile` objects.
5.  It then renders the shared dashboard shell, passing the `user` and `profile` data down to the necessary components.

**Acceptance Criteria:**
-   Each role directory (`employer`, `scientist`, `collaborator`) contains a `layout.tsx`.
-   Accessing a URL like `/employer/dashboard` as a Scientist results in a redirect or "access denied" page, enforced by the layout.
-   The layout successfully fetches and holds the authenticated user's data.

### Feature 2: Shared Dashboard Shell (Sidebar & Header)

**What it does:** Utilizes the existing `Sidebar.tsx` and `Header.tsx` components to build the main visual structure of the dashboard.

**How it works:**
-   **`Header.tsx`:**
    -   Will be a Client Component.
    -   Receives the `user` profile object to display the user's name and avatar in a dropdown menu.
    -   The dropdown menu must contain a "Logout" option that uses the `LogoutButton.tsx` component.
    -   Includes a theme toggle button (`ThemeToggle.tsx`).
    -   Includes a button to toggle the sidebar's visibility on mobile screens.
-   **`Sidebar.tsx`:**
    -   Will be a Client Component to manage its open/closed state.
    -   Receives the user's `role` as a prop.
    -   Conditionally renders navigation links based on the role. Navigation links should be defined in a separate constants file (e.g., `lib/constants/navigation.ts`) for easy management.
    -   Highlights the active navigation link based on the current URL path.

**Acceptance Criteria:**
-   The header correctly displays user information and a functional logout button.
-   The sidebar shows different links for a Scientist versus an Employer.
-   The active navigation link is visually distinct.
-   The layout is responsive, with the sidebar collapsing into a mobile-friendly menu.

### Feature 3: Role-Specific Dashboard Pages

**What it does:** Populates the placeholder dashboard pages (`app/[role]/dashboard/page.tsx`) with initial content relevant to each role.

**How it works:**
1.  Each dashboard page will be a Server Component.
2.  It will fetch any data it needs for initial display (e.g., using placeholder `StatWidget` components).
3.  It will display a "Welcome, [User Name]!" message.
4.  It will include a prominent call-to-action, such as "Complete Your Profile" or "Post a New Job," which links to the relevant page.

**Acceptance Criteria:**
-   The scientist dashboard page shows stats relevant to job applications and projects.
-   The employer dashboard page shows stats relevant to job postings and applicants.
-   Each dashboard provides a clear next step for the user.

### Feature 4: Onboarding Flow Integration (Sets up Batch 4)

**What it does:** The root layout will check for the user's profile completion status and redirect them to the profile editing page if necessary.

**How it works:**
1.  The `Profile` model in `prisma/schema.prisma` should have a `completionScore` or similar field (as planned for Batch 4).
2.  The role-specific `layout.tsx` will check this field on the fetched `profile` object.
3.  If the profile is incomplete and the user is not already on the profile edit page, it will perform a `redirect('/profile/edit')`.

**Acceptance Criteria:**
-   A new user with an incomplete profile is automatically redirected to `/profile/edit` after logging in.
-   A user with a complete profile is not redirected and can access their dashboard.

---

## 3. Technical Architecture

### File Structure

```
authesci-app/
└── app/
    ├── employer/
    │   ├── dashboard/
    │   │   └── page.tsx      // Employer's main dashboard
    │   └── layout.tsx        // Layout for the entire /employer section
    ├── scientist/
    │   ├── dashboard/
    │   │   └── page.tsx
    │   └── layout.tsx
    └── (template)/
        └── profile/
            ├── page.tsx
            └── edit/
                └── page.tsx
lib/
├── constants/
│   └── navigation.ts     // Defines sidebar links for each role
└── services/
    └── auth-service.ts     // Contains getAuthenticatedUser()
components/
├── modules/
│   ├── Sidebar.tsx
│   └── Header.tsx
└── layouts/
    └── DashboardLayout.tsx // This can be used or adapted
```

### Code Example: Role-Specific Layout

```typescript
// authesci-app/app/employer/layout.tsx

import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/services/auth-service';
import { Sidebar } from '@/components/modules/Sidebar';
import { Header } from '@/components/modules/Header';

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  // 1. Protect section and get user data
  const { user, profile } = await getAuthenticatedUser({
    allowedRoles: ['EMPLOYER', 'ADMIN'],
  });

  // 2. Check for profile completion (for Batch 4)
  if (!profile.isComplete && !request.nextUrl.pathname.endsWith('/profile/edit')) {
    // Assuming a field `isComplete` exists on the profile
    // redirect('/profile/edit');
  }

  // 3. Render the shell
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={profile} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 4. Development Roadmap

### Phase 1: Implement Employer Dashboard Layout (3 hours)

-   Create `app/employer/layout.tsx`.
-   Integrate `getAuthenticatedUser` to protect the route.
-   Render the existing `Header.tsx` and `Sidebar.tsx` components, passing the required props (`user`, `role`).
-   Define navigation links for the 'EMPLOYER' role in `lib/constants/navigation.ts`.

### Phase 2: Implement Scientist & Collaborator Layouts (2 hours)

-   Create `app/scientist/layout.tsx` and `app/collaborator/layout.tsx`.
-   Reuse the pattern from the employer layout.
-   Define navigation links for 'SCIENTIST' and 'COLLABORATOR' roles.

### Phase 3: Enhance Header and Sidebar Interactivity (3 hours)

-   Ensure `Header.tsx`'s user menu is functional with a working logout button.
-   Implement the mobile-responsive behavior (sidebar toggle).
-   Implement the active link highlighting in `Sidebar.tsx` using the `usePathname` hook from `next/navigation`.
-   Implement and manage the sidebar's collapsed/expanded state.

### Phase 4: Populate Dashboard Pages & Onboarding Logic (2 hours)

-   Add placeholder content (`StatWidget`, welcome messages) to the `page.tsx` files for each role's dashboard.
-   Implement the profile completion check and redirect logic in the layouts to prepare for Batch 4.

---

## 5. Risks and Mitigations

-   **Risk 1:** Prop-drilling state (e.g., sidebar collapsed state) across components.
    -   **Mitigation:** Use a simple client-side state management solution like Zustand or React Context scoped to the layout if local state becomes insufficient. Start with local state first.
-   **Risk 2:** Complex and duplicated navigation logic.
    -   **Mitigation:** Centralize all navigation link definitions in `lib/constants/navigation.ts`, structured by role, to keep the `Sidebar.tsx` component clean.
-   **Risk 3:** Flash of unstyled or incorrect content before redirect.
    -   **Mitigation:** Perform all authentication and authorization checks on the server within the `layout.tsx` file. The `getAuthenticatedUser` service already handles this, so sticking to the pattern is key.

---

## 6. Success Criteria

Batch 3 is complete when:
-   A logged-in user is correctly routed to their role-specific dashboard (e.g., `/employer/dashboard`).
-   The dashboard displays a consistent layout with a header and a sidebar.
-   The sidebar shows navigation links that are specific to the user's role.
-   The header shows the user's name/avatar and has a functional logout button.
-   The layout is responsive and works on mobile devices.
-   An unauthenticated user attempting to access any dashboard URL is redirected to `/login`.
-   A user with one role (e.g., Scientist) cannot access the dashboard of another role (e.g., `/employer/dashboard`).
