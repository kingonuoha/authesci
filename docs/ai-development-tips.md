# AI Development Tips for Authesci Project

This document contains a summary of observations and guardrails for AI-driven development on the Authesci project. Following these guidelines will help ensure consistency and accuracy.

## 1. UI/UX and Styling

**Always use the `wowdash` template for UI components.**

-   **Central Authentication Component:** `authesci-app/components/modules/auth/AuthCard.tsx` is the central component for all authentication forms (login, signup, forgot password, reset password).
-   **Form Input Component:** Use `authesci-app/components/modules/auth/FormInput.tsx` for consistent input styling. It is designed to receive and display field-specific errors from server actions.
-   **Toast Notifications:** Use the `showToast` helper from `lib/utils.ts` for all user feedback (success, error, info).
-   **Iconography:** Prefer `lucide-react` icons over `iconify-icon` for consistency.
-   **Template Directory:** `authesci-app/templates/wowdash`. Refer to the HTML files in `wowdash-tailwind-admin/src/html/pages` for base structure and CSS classes.

### 1.1. Component Import Style

-   **Default Imports for Components:** When importing components like `Sidebar` or `Header`, prefer default imports (e.g., `import Sidebar from '@/components/modules/Sidebar';`) over named imports (e.g., `import { Sidebar } from '@/components/modules/Sidebar';`). Named imports for these components can lead to errors.

### 1.2. Layout Alignment and Responsiveness

-   **WowDash Template Comparison:** When integrating `wowdash` template elements, carefully compare the HTML structure and class hierarchy of the template's `index.html` with the React component structure.
-   **Avoid Redundant Wrappers:** Do not introduce redundant container divs (e.g., `container mx-auto py-8`) in page components if the layout already provides a suitable wrapper (e.g., `dashboard-main-body`). This can cause layout conflicts.
-   **Structural Component Placement:** Ensure all structural components (Sidebar, Header, Breadcrumb, Footer) are correctly placed within the layout and styled according to the template's intended hierarchy.
-   **Conditional Class Application:** Utilize conditional class names (e.g., `${isSidebarOpen ? '' : 'active'}`) to dynamically manage responsive layouts and component states, such as sidebar collapse/expansion.
-   **Sidebar Collapse Mechanism:** For collapsible sidebars, ensure that the CSS classes (e.g., `.sidebar.active`) accurately define the collapsed width (e.g., `width: 80px;`) and that the component applies the correct class based on its state. Be mindful of CSS specificity to prevent unintended overrides of utility classes.

## 2. Authentication & Authorization

### 2.1. Page Structure and Routing

-   **Auth Pages:** All authentication-related pages (login, signup, etc.) reside in the `authesci-app/app/(auth)/` directory group.
-   **Role-Based Routing:** All pages and features specific to a user role are grouped under a top-level folder named after that role. For example, all employer-related pages (dashboard, job management, applicant viewing) must be located within the `app/employer/` directory. This creates a clean, scalable, and predictable routing structure (e.g., `/employer/dashboard`, `/employer/jobs/new`).

### 2.2. Core Logic and Server Actions

-   **Server Actions File:** All authentication logic (signup, login, logout, etc.) is handled via Server Actions in `authesci-app/app/actions/auth.ts`.
-   **Error Handling:** Server actions must return structured errors that include the field path, allowing `AuthCard.tsx` to display inline error messages next to the relevant inputs.
-   **Logout:** Use the `authesci-app/components/modules/auth/LogoutButton.tsx` client component to correctly invoke the `logout()` server action.

### 2.3. Role Management and JWT

-   **Role in JWT:** To enable performant authorization, the user's `role` (e.g., 'SCIENTIST') is stored in the Supabase JWT's `app_metadata`. This allows the middleware to check roles without a database query.
-   **Supabase Admin Client:** For any action that modifies `app_metadata` (like setting the role), the dedicated admin client at `authesci-app/lib/supabase/admin.ts` **must** be used. This client is initialized with the `SUPABASE_SERVICE_ROLE_KEY`.
-   **Role Backfilling:** The `login` server action includes logic to "backfill" the role into the `app_metadata` for existing users who may not have it in their JWT, ensuring forward compatibility.

## 3. Middleware (`proxy.ts`)

-   **File Location:** The primary middleware file is `authesci-app/proxy.ts`, which calls the helper at `authesci-app/lib/supabase/proxy.ts`.
-   **Authentication:** The middleware redirects any **unauthenticated** user trying to access a protected route to `/login`.
-   **Authorization (Role Protection):** The middleware is the single source of truth for role-based access. It reads the `role` from the user's JWT and redirects them to their correct dashboard if they attempt to access a page belonging to another role (e.g., a 'SCIENTIST' trying to view `/employer/dashboard`).
-   **Auth Page Protection:** The middleware redirects any **authenticated** user trying to access an auth page (e.g., `/login`, `/signup`) to their dashboard.

## 4. Post-Authentication Session Refresh

-   **Problem:** After a user logs in and their `app_metadata` is updated, their session JWT may be stale, causing the middleware to miss the new `role`.
-   **Solution:** A two-step redirect pattern is used to solve this reliably:
    1.  The `login` action redirects to `/auth/session-refresh`.
    2.  The `authesci-app/app/auth/session-refresh/page.tsx` Server Component fetches the user's fresh session data.
    3.  It passes the correct dashboard URL to a client component that performs a client-side redirect, ensuring the browser URL is updated correctly.

## 5. Services & Integrations

### 5.1. Centralized User Service

-   **`getAuthenticatedUser`:** For fetching the current user and their associated Prisma profile in Server Components (like dashboard pages), always use the `getAuthenticatedUser` function from `authesci-app/lib/services/auth-service.ts`. This centralizes the logic and handles redirects for unauthenticated users automatically.

### 5.2. Email Integration (Hostinger SMTP)

-   **Nodemailer Setup:**
    -   Install `nodemailer` and `@types/nodemailer`.
    -   `authesci-app/lib/mail.ts` configures and exports the Nodemailer transporter and `sendEmail` function.
-   **Email API Route:** `authesci-app/app/api/mail/route.ts` handles sending emails via a POST request.
-   **Custom Email Templates:** HTML and text email templates are located in `authesci-app/emails/`.
-   **Usage:** Server Actions (e.g., `signUp`) call the `sendEmail` function.
-   **Password Reset Exception:** The `requestPasswordReset` action relies on Supabase's built-in email sending for security. Configure the template directly in the Supabase dashboard.

## 6. Environment & Tooling

### 6.1. Supabase Environment Variables

-   **`.env.local`:** Ensure the following variables are set in `authesci-app/.env.local`:
    -   `NEXT_PUBLIC_SUPABASE_URL`: The public URL for your Supabase project.
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key.
    -   `SUPABASE_SERVICE_ROLE_KEY`: The secret service role key. **Never expose this key to the client side.**
    -   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` for email.

### 6.2. General Tips

-   **Fetching `origin`:** In Server Actions, use `(await headers()).get("origin")` to correctly get the request's origin URL.
-   **Task Management:** Use the `taskmaster-ai` MCP to manage development tasks.

### 6.3. Development Utilities

-   **Role Switching for Development:** For development environments, a role-switching mechanism can be implemented using an environment variable (e.g., `NEXT_PUBLIC_ENABLE_ROLE_SWITCHING`). This feature allows developers to easily switch user roles (e.g., Scientist, Employer, Admin) from the UI (e.g., in the header dropdown). It requires a Server Action to update the user's role in both the Prisma profile and Supabase `app_metadata`, followed by a `revalidatePath` to refresh the UI. The `RoleSwitcher` component should conditionally render based on the environment variable to prevent it from appearing in production.

By following these guidelines, we can ensure a more efficient, secure, and consistent development process.

## 7. Recent Lessons Learned (UI/UX & Build Stability)

### 7.1. Styling & Tailwind CSS
-   **Global vs. Minified CSS:** The project uses a pre-compiled `style.css` which may miss standard Tailwind utilities (e.g., `animate-spin`, `input-error`). Always check `globals.css` and manually add missing utility classes there if they are not working out of the box.
-   **Gradient Visibility:** When using `bg-gradient`, ensure you don't over-complicate `bg-size` (e.g., `bg-[length:200%_auto]`) unless necessary, as it can sometimes cause the gradient to appear invisible on certain elements. Simple `bg-gradient-to-r` often suffices.
-   **Z-Index Context:** For overlapping elements (like avatars on cards), explicitly set `z-index` and `position: relative` to ensure they stack correctly against backgrounds and borders.

### 7.2. Component Architecture
-   **Client-Side Interactivity:** Any component that uses hooks (`useState`, `useEffect`) or event handlers (`onClick`) **MUST** have `"use client";` at the very top of the file. This is a common source of build failures.
-   **Shadcn UI Integration:** When adding new Shadcn components (e.g., `dialog`, `avatar`), ensure `tsconfig.json` paths (`@/components/ui/*`) are correctly mapped. You may need to restart the TS server or build process if "Cannot find module" errors persist.
-   **Granular Components:** Break down complex UIs into smaller, focused components (e.g., `AiFillButton`, `ApplicantAvatarGroup`). This makes styling and debugging much easier than monolithic files.

### 7.3. Build & Layout Stability
-   **Layout Rendering Errors:** Persistent "rendering error" messages during `npm run build` often originate from high-level Layout components (`AppLayout`, `DashboardLayout`). Check for:
    -   Prop mismatches (e.g., passing `undefined` where a boolean is expected).
    -   Client/Server boundary violations (importing a Server Component into a Client Component without proper composition).
-   **Clean Build Environment:** If build errors persist despite code fixes, try clearing the `.next` cache and `node_modules` to ensure a clean slate.

### 7.4. Visual Consistency
-   **Template Reference:** Always cross-reference new UI components with the `wowdash` HTML templates (e.g., `users-grid.html`, `list.html`) to ensure they match the intended premium aesthetic.
-   **Icons:** Use `lucide-react` as the standard icon library. Avoid mixing with other icon sets unless absolutely necessary.