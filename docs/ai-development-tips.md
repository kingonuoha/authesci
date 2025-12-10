# AI Development Tips & Lessons Learned

## Overview
This document captures key learnings, patterns, and best practices discovered during the development of Authesci's AI features (Batch 8). Future developers should refer to this when extending AI capabilities or debugging existing ones.

## 1. Vector Search & Embeddings

### Implementation Details
- **Library:** We use `google-generative-ai` (Gemini) for generating text embeddings.
- **Database:** Supabase (PostgreSQL) with `pgvector` extension.
- **Prisma:** We use `Unsupported("vector")` type in schema and `prisma.$executeRaw` / `prisma.$queryRaw` for vector operations.

### Lessons Learned
- **Type Casting:** Prisma doesn't natively support vector types in TypeScript yet. We must cast embeddings to strings (e.g., `[0.1, 0.2, ...]`) before passing them to raw SQL queries.
- **Dimensionality:** Ensure the database vector column dimension matches the model's output (Gemini `text-embedding-004` uses 768 dimensions).
- **Indexing:** For performance on large datasets, an IVFFlat index is recommended on the `aiFeatureVector` column.

### Common Pitfalls
- **Missing Extension:** Always ensure `CREATE EXTENSION IF NOT EXISTS vector;` is run in the database migration.
- **Null Vectors:** Handle cases where `aiFeatureVector` is null (legacy data) gracefully in search queries.

## 2. AI-Powered Job Matching

### Logic
- **Profile Embedding:** Generated from `skills`, `bio`, and `experience`.
- **Job Embedding:** Generated from `title`, `description`, and `requirements`.
- **Ranking:** We calculate cosine similarity (1 - cosine distance) between profile and job vectors.

### Observations
- **Hybrid Search:** Pure vector search can miss exact keyword matches (e.g., specific tools). A hybrid approach (Vector + Keyword Filter) is often better.
- **Latency:** Embedding generation adds latency. It's best to generate embeddings asynchronously (e.g., via background jobs or queues) rather than blocking the user request. Currently, we do it inline for simplicity but this should be optimized.

## 3. Notifications System

### Architecture
- **Dual Channel:** Notifications are sent via In-App (Database) and Email (Nodemailer).
- **Real-time:** We use polling (every 60s) in `NotificationBell` for simplicity. For true real-time, Supabase Realtime or WebSockets should be used.

### Best Practices
- **Idempotency:** Ensure notification actions (like "Mark as Read") are idempotent.
- **Batching:** When sending bulk notifications (e.g., "New Job Alert" to 1000 users), use a queue system (like BullMQ) to avoid timeouts and rate limits.

## 4. Image Handling (Cropping)

### Implementation
- **Library:** `react-easy-crop` for the UI.
- **Process:** Client-side cropping -> Canvas blob generation -> Upload to Cloudinary.

### Tips
- **File Types:** Always convert the canvas blob to `image/png` or `image/jpeg` explicitly to avoid issues with transparency or file size.
- **Aspect Ratio:** Enforce 1:1 for avatars and logos to ensure UI consistency.

## 5. Environment Variables & Feature Flags

- **`NEXT_PUBLIC_ENABLE_AI_FEATURES`:** We use this flag to conditionally render AI UI elements and skip AI logic in backend actions. This is crucial for testing and cost control.
- **`SMTP_HOST`:** In development, if SMTP is missing, we log emails to the console instead of crashing. This improves the developer experience (DX).

## 6. Future Improvements

- **RAG (Retrieval-Augmented Generation):** For even better cover letters, we could retrieve similar successful applications (anonymized) to guide the generation.
- **Feedback Loop:** Capture user feedback (e.g., "Not relevant" on job recommendations) to fine-tune the matching algorithm.

## 7. Real-time Chat & Messaging (Batch 10)

### Real-time Architecture
- **Supabase Realtime:** We use `postgres_changes` to listen for new messages and participant updates.
- **Case Sensitivity:** Supabase payloads use `snake_case` (DB columns), while our frontend uses `camelCase`. **Crucial:** You must manually map these fields in the subscription callback (e.g., `attachment_url` -> `attachmentUrl`).
- **Deduplication:** Real-time events can race with optimistic updates. Always check if a message ID (`prev.some(m => m.id === newMessage.id)`) exists before appending to state.

### Optimistic UI Patterns
- **Message Sending:** Create a temporary ID (`temp-${Date.now()}`), add to state immediately, then replace with the real server response.
- **Error Handling:** If the server action fails, remove the optimistic message and show a toast error.

### Database Schema & Prisma
- **Prisma Generate:** If you encounter `EPERM` errors during `npx prisma generate`, **stop the dev server** first. The running server locks the files.
- **New Fields:**
  - `Profile.lastSeenAt`: For user online status.
  - `Participant.lastReadAt`: For read receipts.
  - `Message.attachmentUrl` / `attachmentType`: For file sharing.

### File Uploads (Cloudinary)
- **Security:** We use signed uploads. The server generates a signature (`getUploadSignature`), and the client uploads directly to Cloudinary.
- **Env Vars:** Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set. The code falls back to `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` if the standard one is missing.

### AI Integration (Gemini)
- **Env Vars:** The bot accepts `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`.
- **Context Window:** When generating responses, we inject a system prompt ("You are Authesci Admin Bot...") to ground the AI.

### UI/UX Tips
- **Router Refresh:** When a Server Action updates data that a Server Component depends on (like the sidebar list), call `router.refresh()` in the client component to force a re-render of the server parts.
- **Group Logic:** Group chats use random names if not specified. Admin users have a special query in `getConversations` to see *all* group chats, not just ones they are in.

## 8. General Development & Architecture Patterns

### Server Actions & Circular Dependencies
- **Issue:** Importing a server action (e.g., `getProfileId` from `actions/auth.ts`) into another server action or a client component can sometimes lead to "Export doesn't exist" build errors or circular dependency warnings, especially if the source file imports large libraries or other actions.
- **Solution:** Extract shared utility logic into a separate `lib/` file (e.g., `lib/auth-utils.ts`). This ensures that both Server Actions and Components can import the logic without triggering the Next.js build optimization issues associated with "use server" boundaries.
- **Rule of Thumb:** If a function is a helper (like getting a user ID) and not a direct mutation/action called by a form, put it in `lib/`.

### Client-Side Wrappers (SSR Compatibility)
- **Issue:** Libraries like `react-apexcharts` or `leaflet` rely on the `window` object and break during Next.js Server Side Rendering (SSR).
- **Solution:** Create a wrapper component (e.g., `ApexChartWrapper.tsx`) that uses `next/dynamic` with `{ ssr: false }` or a `useEffect` mount check.
- **Pattern:**
  ```tsx
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  // OR
  if (!isMounted) return null;
  ```

### Centralized Logging
- **Implementation:** We implemented a `logActivity` function in `@/lib/logger.ts`.
- **Usage:** Call this in **every** mutation server action (Create, Update, Delete) to maintain a comprehensive audit trail.
- **Schema:** The `Log` model connects to `Profile`, allowing us to show users their own history and Admins a global view.

### Supabase vs. Prisma
- **Supabase Client (`@/lib/supabase/server`):** Use primarily for **Authentication** (getUser, signOut) and **Realtime** subscriptions.
- **Prisma Client (`@/lib/prisma`):** Use for **Data Access** and **Business Logic**. It provides type safety and relationship handling that is superior for complex queries.
- **Pattern:** In a server action, first `await supabase.auth.getUser()` to verify identity, then use `prisma.profile.findUnique()` to get the application-specific user data.

### Visual Notifications
- **Metadata:** The `Notification` model's `metadata` JSON field is used to store `visual_type` ('image' | 'icon') and `visual_resource` (URL or icon name).
- **UI:** The `NotificationItem` component dynamically renders an `<img>` or a lucide-react Icon based on this metadata, providing richer context than a simple text toast.

### Next.js Build & Suspense
- **Issue:** Using `useSearchParams()` in a Client Component without a `<Suspense>` boundary causes build failures (`npm run build`) because Next.js needs to know how to handle the component during static generation.
- **Solution:** Wrap the component usage in `<Suspense fallback={<Loading />}>` or move the `useSearchParams` logic into a child component that is wrapped.

## 9. Admin Analytics & Charts (Batch 11)

### ApexCharts in Next.js (React 19/Turbopack)
- **Issue:** The `react-apexcharts` wrapper library can cause hydration errors (`t.put is not a function`, `Cannot read properties of undefined`) and compatibility issues with React 19.
- **Solution:** Use the native `apexcharts` library directly within a `useEffect` hook.
- **Implementation:** Create a wrapper component (`ApexChartWrapper`) that dynamically imports `apexcharts` (using `await import('apexcharts')`) inside `useEffect` to ensure it only runs on the client.
- **Version:** Ensure `apexcharts` version is stable (e.g., `3.49.0`). Avoid `5.x` versions if they are not officially supported or cause issues.
- **Cleanup:** Always destroy the chart instance in the `useEffect` cleanup function (`chartInstance.current.destroy()`) to prevent memory leaks and rendering artifacts.

### Server Actions & Decimal Types
- **Issue:** Passing Prisma `Decimal` types directly from Server Actions to Client Components causes serialization errors or runtime errors like `totalRevenue.toNumber is not a function` if not handled correctly.
- **Solution:** Convert `Decimal` to `number` (using `.toNumber()`) *inside* the Server Action before returning the data to the client.
- **Safety:** Check if the value is already a number (e.g., `0`) before calling `.toNumber()` to avoid runtime crashes.

### Admin Analytics & Data Fetching
- **Pattern:** For complex analytics (like charts with time toggles), use a dedicated Server Action (e.g., `getAnalyticsChartData`) that accepts parameters (period, type) and returns formatted data.
- **Client-Side Fetching:** Call these Server Actions from `useEffect` in Client Components to allow for dynamic updates (like switching between Day/Week/Month) without full page reloads.

### UI/UX - Charts
- **Modern Look:** Use gradients (`fill: { type: 'gradient' }`), smooth curves (`stroke: { curve: 'smooth' }`), and custom color palettes to make charts look modern.
- **Overlapping/Mixed Charts:** You can mix `line` and `area` types or use multiple `area` series with transparency to creating overlapping effects.
- **Radial Bars:** Great for "Health" or "Progress" metrics. Use `hollow` centers and `track` backgrounds for a cleaner look.

### Prisma Seeding
- **Analytics:** When seeding analytics data (PageViews, Logs), ensure you generate data with realistic timestamps (backdated) to populate charts effectively for testing.

## 10. Public Frontend Refactoring & Architecture (Batch 12)

### Multiple Root Layouts
- **Pattern:** To isolate the Dashboard's heavy assets/CSS from the Public Marketing site, we use Next.js **Route Groups** with separate root layouts.
- **Structure:**
  - `app/(app)/layout.tsx`: Root layout for the authenticated app (Dashboard, Auth). Loads `globals.css` (Tailwind/Shadcn).
  - `app/(public)/layout.tsx`: Root layout for the public site. Loads `public.css` (Marketing template styles).
- **Crucial:** Both layouts must define their own `<html>` and `<body>` tags. There should be no top-level `app/layout.tsx` if all routes are covered by these groups.

### Import Path Fixes
- **Issue:** Moving files into `app/(app)` breaks absolute imports that assume `app/actions` or `app/profile`.
- **Solution:** Update import paths to reflect the new structure.
  - `@/app/actions/...` -> `@/app/(app)/actions/...`
  - `@/app/profile/ProfilePage` -> `@/app/(app)/profile/ProfilePage`
- **Tip:** When refactoring directory structure, always check for absolute imports starting with `@/app/...`.

### Asset Management
- **Separation:** Public assets (images, CSS, JS) for the marketing site should be kept in a dedicated folder (e.g., `public/front-assets/`) to avoid clutter and conflicts with the main app assets.

### Template Switching
- **Clean Slate:** When switching frontend templates, it is often cleaner to remove the old public pages and components entirely rather than trying to patch them. This ensures no legacy styles or scripts interfere with the new design.

## 11. Responsive UI & Template Integration (Batch 13)

### Template Integration
- **Structure Over Wrappers:** When using third-party HTML templates (e.g., `freeio-html`), prefer standard Bootstrap classes (like `d-flex`, `container`, `row`) over the template's custom wrappers (like `home1_style`) if they cause layout issues. The custom classes often have hidden `position: absolute` or specific display properties that break in modern React/Next.js flows.
- **Dependency Isolation:** Avoid importing template-specific JS files globally if they manipulate the DOM aggressively (like some complex mega-menu scripts). Re-implement the logic in React or use simplified HTML structures.

### Authentication State in Global Components
- **Server-Side Fetching:** For global components like `PublicNavbar` that render on every page, fetch user data (session/profile) in the server-side Layout (`layout.tsx`) and pass it down as props.
- **Benefits:** This prevents "flicker" on client-side state checks and avoids making the Navbar an `async` component (which can be problematic if imported into other client components).
- **Pattern:**
  ```tsx
  // app/(public)/layout.tsx
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user ? await prisma.profile.findUnique(...) : null;
  return <PublicNavbar user={user} profile={profile} />
  ```

### Bootstrap vs Tailwind
- **Consistency:** If a section of the app (like the Public Marketing site) uses Bootstrap via a template, stick to Bootstrap utility classes for overrides. Mixing Tailwind classes into a Bootstrap-heavy DOM can lead to unpredictable specificity wars, especially with `!important` flags in template CSS.
- **Grid System:** Respect the template's grid. If it uses `col-lg-8`, don't try to force a Tailwind `w-2/3` alongside it unless you are rewriting the entire container.

### Visual Polish
- **Image Fallbacks:** Always implement a 3-tier fallback for user/company avatars: `Company Logo` -> `User Avatar` -> `Default Placeholder` (like UI Avatars). This ensures the UI never looks broken for new users.
- **Navigation:** Simplify dropdowns for mobile. Complex nested menus from HTML templates often rely on jQuery. For React, a simple flat list or a single-level Accordion is often more robust and accessible.