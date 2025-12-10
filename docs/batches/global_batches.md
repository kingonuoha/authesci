REVISED Authesci — Project Batches Overview (Next.js + Supabase + Prisma Stack)
Tech Stack Confirmation:

Frontend: Next.js 16 (App Router) + TypeScript
Styling: Tailwind CSS + Shadcn/UI
Backend: Supabase (Auth + Realtime + Storage)
Database: PostgreSQL (Supabase) + Prisma ORM
Payments: Paystack
Email: Hostinger SMTP + Nodemailer
Storage: Cloudflare R2 (via Prisma/API routes)
Deployment: Vercel


Week 1: Foundation + Core Loops
### 🧩 **Batch 1: Project Setup & Template Integration** ✅ (Current - In Progress)
Goal: Establish clean codebase, environments, and UI foundation.
Sub-modules:
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "@prisma/client": "^5.20.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
Status: ~85% complete (per your task JSON)
Remaining Tasks:

- Add Prisma integration
- Complete template prototype pages
- Finalize documentation


### 🎨 **Batch 1.5: Template Component Library** ⭐ NEW
Goal: Convert WowDash html/ snippets into reusable Next.js Server/Client Components.
Sub-modules:

Extract and convert core UI components:

- JobCard.tsx (Client Component - has onClick handlers)
- ProjectCard.tsx (Client Component - interactive)
- StatWidget.tsx (Server Component - displays stats)
- Sidebar.tsx (Client Component - navigation state)
- Navbar.tsx (Client Component - user menu, notifications)
- ApplicationCard.tsx (Client Component - status actions)
- TaskCard.tsx (Client Component - drag & drop)
- EmptyState.tsx (Server Component - static placeholder)
- LoadingSkeleton.tsx (Server Component - loading states)



Next.js Specific Considerations:

- Use "use client" directive for interactive components
- Keep Server Components as default for static content
- Use Next.js <Image> component for optimized images
- Use Next.js <Link> for internal navigation
- Implement proper TypeScript interfaces for all props

Component Structure Example:
```typescript
// components/modules/JobCard.tsx
"use client"; // Only if component has interactivity

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface JobCardProps {
  id: string;
  title: string;
  company?: string;
  location?: string;
  salary?: string;
  jobType: "remote" | "hybrid" | "on-site";
  onSave?: (jobId: string) => void;
}

export function JobCard({ id, title, company, location, salary, jobType, onSave }: JobCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <Link href={`/jobs/${id}`}>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{company} • {location}</p>
      </Link>
      <div className="mt-3 flex gap-2">
        <Button asChild>
          <Link href={`/jobs/${id}/apply`}>Apply Now</Link>
        </Button>
        {onSave && (
          <Button variant="outline" onClick={() => onSave(id)}>
            Save
          </Button>
        )}
      </div>
    </Card>
  );
}
```

UI Behaviors (Next.js Compatible):

Use Shadcn/UI components for complex interactions:

- DropdownMenu for user menus
- Dialog for modals
- Sheet for mobile sidebars
- Tabs for tabbed interfaces
- Select for dropdowns


Avoid any jQuery or vanilla DOM manipulation
Use React hooks (useState, useEffect) for state management
Use useRouter from next/navigation for programmatic navigation

Dependencies: Batch 1
Duration: 1 day

### 🔐 **Batch 2: Authentication & Session Management** ✅ (Completed)
Goal: Implement secure, role-based authentication with Supabase Auth + Prisma.
Status: Completed. The implementation details below reflect the final architecture.

Key Architectural Decisions:
- JWT Role Management: The user's `role` is stored in the Supabase JWT `app_metadata` for performant role checks in the middleware without needing a database query.
- Middleware Enforcement: The middleware at `authesci-app/proxy.ts` is the single source of truth for protecting routes and enforcing role-based access.
- Session Refresh Pattern: A redirect to `/auth/session-refresh` after login ensures the client-side session is immediately updated with the new JWT containing the user's role.

Sub-modules:
Supabase Auth Setup:
- Configured using `@supabase/ssr` for the Next.js App Router.
- Utilities created in:
  - `lib/supabase/server.ts` (for Server Components)
  - `lib/supabase/client.ts` (for Client Components)
  - `lib/supabase/admin.ts` (for admin-level actions like updating JWT metadata)

Prisma Schema for Auth:
- The `Profile` model links to Supabase's `auth.users` table and includes a `Role` enum.
prisma// prisma/schema.prisma
model Profile {
  id          String   @id @default(uuid())
  userId      String   @unique // Supabase auth.users.id
  email       String   @unique
  fullName    String
  role        Role     @default(SCIENTIST)
  // ... other fields
}

enum Role {
  SCIENTIST
  EMPLOYER
  COLLABORATOR
  ADMIN
}

Auth Pages (App Router):
- All auth pages are located under `app/(auth)/` and use a shared layout.
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/signup/page.tsx`
  - `app/(auth)/forgot-password/page.tsx`
  - `app/(auth)/reset-password/page.tsx`
  - `app/(auth)/verify-email/page.tsx`
  - `app/auth/session-refresh/page.tsx` (Handles post-login session update)

Auth Components (Client Components):
- `components/modules/auth/AuthCard.tsx`: Central UI for all auth forms.
- `components/modules/auth/FormInput.tsx`: Standardized input field with error display.
- `components/modules/auth/LogoutButton.tsx`: Client component to trigger the logout server action.

Server Actions for Auth:
- All core logic is in `app/actions/auth.ts`.
- Actions return structured errors for inline form validation.
- The `login` action backfills the `role` into the JWT for existing users.

Middleware for Route Protection:
- The main middleware file is `authesci-app/proxy.ts`.
- It protects routes based on authentication status and user role (read from the JWT).
- Redirects unauthenticated users to `/login`.
- Redirects authenticated users away from auth pages.
- Enforces role-specific dashboard access (e.g., a 'SCIENTIST' cannot access `/employer/dashboard`).

Email Integration (Hostinger SMTP):
- Nodemailer is configured in `lib/mail.ts` and used via an API route at `app/api/mail/route.ts`.
- Custom email templates are in the `emails/` directory.
- Note: Password reset emails are sent directly by Supabase to ensure security.

Toast Notifications:
- Uses Shadcn/UI `toast` component, with the `<Toaster />` in the root layout.

Dependencies: Batch 1
Duration: 2 days

---

### 🧭 **Batch 3: Dashboard Layouts & Navigation**

**Goal:** Build role-aware dashboard structures with Server Components + Client interactivity.

**Sub-modules:**

**Layout Structure (App Router):**
- Each role gets its own top-level directory containing its layout and pages.
```
app/
├── employer/
│   ├── layout.tsx  // Main layout for the employer section
│   └── dashboard/
│       └── page.tsx  // The employer's main dashboard page
├── scientist/
│   ├── layout.tsx
│   └── dashboard/
│       └── page.tsx
└── collaborator/
    ├── layout.tsx
    └── dashboard/
        └── page.tsx
```

**Dashboard Layout (Server Component Example):**
- The layout file within each role's directory (`app/employer/layout.tsx`) will be responsible for fetching user data and protecting the routes within that section.
```typescript// app/employer/layout.tsx
import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Sidebar } from "@/components/modules/Sidebar";
import { Header } from "@/components/modules/Header";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  // Centralized service handles auth check, profile fetching, and redirects
  const { user, profile } = await getAuthenticatedUser({
    allowedRoles: ["EMPLOYER", "ADMIN"], // Protects this entire section
  });

  return (
    <div className="flex h-screen">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col">
        <Header user={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Dashboard Components:**
- `Sidebar.tsx` (Client Component - handles navigation state)
- `Header.tsx` (Client Component - user menu, theme toggle)
- `StatWidget.tsx` (Server Component - fetches and displays data)
- `RecentActivity.tsx` (Server Component)

**Onboarding Flow:**
- The layout will check for profile completion and can redirect to an onboarding page if necessary (e.g., `/profile/edit`).

**Dependencies:** Batch 1.5, Batch 2
**Duration:** 1.5 days

---

### 👤 **Batch 4: Profile Setup & Management**

**Goal:** Enable users to create and manage their profiles using Server Actions.

**Prisma Schema Extension:**
```prisma
model Profile {
  // ... existing fields
  publications    String[]
  certifications  String[]
  completionScore Int      @default(0)
}
```

**Server Actions for Profile:**
- A robust `updateProfile` server action will handle form data and file uploads.
```typescript// app/actions/profile.ts
"use server";
// ...
export async function updateProfile(formData: FormData) {
  // ... logic to update profile in Prisma
  revalidatePath("/profile");
}
```

**File Upload (CVs, Avatars):**
- Use a server action that uploads files to a storage provider (like Supabase Storage or Cloudflare R2) and updates the `cvUrl` or `avatarUrl` field in the `Profile` model.

**Profile Pages:**
- These pages are not role-specific and live in a general authenticated area.
- `app/(template)/profile/page.tsx` (Server Component to display the user's own profile)
- `app/(template)/profile/edit/page.tsx` (Server Component rendering a Client form for editing)

**Profile Components:**
- `ProfileForm.tsx` (Client Component with validation)
- `SkillsInput.tsx` (Client Component for tag-style input)
- `FileUploader.tsx` (Client Component for drag-and-drop uploads)

**Dependencies:** Batch 3
**Duration:** 1.5 days

---

### 💼 **Batch 5: Job Marketplace (Full Loop)**

**Goal:** Implement the complete job lifecycle: posting, browsing, applying, and managing applications.

**Prisma Schema:**
```prisma
model Job {
  // ... fields
}
model Application {
  // ... fields
}
```

**Server Actions:**
- `app/actions/jobs.ts`: `createJob`, `updateJob`, `deleteJob`.
- `app/actions/applications.ts`: `applyForJob`, `updateApplicationStatus`.

**Page Structure (Role-First):**

- **Public Job Board:**
  - `app/jobs/page.tsx` (Job listings for everyone)
  - `app/jobs/[id]/page.tsx` (Public view of a single job)
  - `app/jobs/[id]/apply/page.tsx` (Page for a scientist to apply)

- **Employer-Specific Pages:**
  - `app/employer/jobs/page.tsx` (List of jobs posted by the employer)
  - `app/employer/jobs/new/page.tsx` (Form to create a new job posting)
  - `app/employer/jobs/[id]/edit/page.tsx` (Form to edit an existing job)
  - `app/employer/jobs/[id]/applicants/page.tsx` (View applicants for a specific job)

- **Scientist-Specific Pages:**
  - `app/scientist/applications/page.tsx` (View all jobs the scientist has applied to)

**Dependencies:** Batch 4
**Duration:** 2.5 days

🧪 Batch 6: Project Workspace (Kanban & Collaboration)
Goal: Implement the private workspace where actual work happens after a Scientist is hired.


Context: This covers the Week 4 requirement for "Project Foundation" and "Task Management," aligning with the defined Project Workspace User Flow.

Key Features:

Job-to-Project Transition:

Logic to auto-create a Project when a Job Application is marked as "Hired".

Populate Project Members (Scientist + Employer) automatically.

Kanban Board (WowDash Integration):

UI: Port the WowDash Kanban HTML to React.

Tech: Use @dnd-kit/core for drag-and-drop functionality.


Columns: Implement "To Do | In Progress | Done" as specified in the user flow.


Task Details: Include Task Title, Due Date, and Priority.



Realtime: Sync card movements instantly using Supabase Realtime.

File Management (Cloudflare R2):

Uploads: Implement the presigned URL flow (/api/upload) to send files directly to Cloudflare R2.


UI: A "Documents" tab in the workspace to list files by type (PDF, CSV, etc.).


Dependencies: Batch 5 Duration: 3 days

💰 Batch 7: Payment & Escrow
Goal: Monetize the platform and handle secure project payments. Context: Covers Week 4 (Friday) "Escrow Flow" and Week 3 "Job Posting Fees."

Key Features:

Job Posting Fee (Employer):

Paystack Checkout integration for publishing a job.

Webhook listener to change Job Status from DRAFT → ACTIVE upon payment success.

Project Escrow System (MVP):

Fund Project: Employer deposits funds via Paystack.

Hold Funds: Database status updates to ESCROW_HELD.

Release Funds: "Release Payment" button in the Project Workspace (Employer only) when the project tasks has been completed, and the scientist has marked as work completed( new column might need to be created or added to the project model).

Payout: Logic to mark funds as RELEASED (Actual Payouts are confirmed by admin, so the funds are marked as RELEASED, and the employer is paid via Paystack).
a dedicated admin page to handle all payouts, admin can see list of pending payouts and processed payouts
on successful payout, the job status should be updated to COMPLETED


Dependencies: Batch 6 Duration: 2 days

### 🔔 BATCH 8 — NOTIFICATIONS + AI SYSTEM (FINAL PRD UPDATE)
(Concise, precise, only new/changed models)
1. DATABASE MODEL UPDATES

Only showing models that change:

🔹 Model: Profile (UPDATED)
Added

cvUrls: String[]

cvIntel: Json?

aiFeatureVector: Vector? (for hybrid matching — skills embeddings)

isPremium: Boolean @default(false) (for AI gating)

🔹 Model: Job (UPDATED)
Added

aiFeatureVector: Vector?

aiIntel: Json? (summary of job for employer insights)

aiRecommendedScientists: Json? (cached ranked scientist IDs)

🔹 Model: JobApplication (UPDATED)
Added

aiMatchScore: Float?

aiIntel: Json? (why they are a match — used for employer view)

🔹 Model: Notification (NEW)
model Notification {
  id             String    @id @default(cuid())
  userId         String
  title          String
  message        String
  type           String // "job_recommendation" | "application_status" | "system" | "ai_insight"
  isRead         Boolean   @default(false)
  link           String?   // URL to open on click
  createdAt      DateTime  @default(now())

  user           Profile   @relation(fields: [userId], references: [id])
}

2. AI FEATURES FOR THIS BATCH
🔹 2.1 CV Parsing & Intel Refresh

Triggered when:

A CV is uploaded

A CV is deleted

Pipeline

Upload to Cloudinary

Function extract_cv_text()

Gemini generates:

skills

experience timeline

certificates

keywords

embeddings (64D vector)

Save:

cvIntel

aiFeatureVector

🔹 2.2 AI Job Recommendations (Hybrid Mode)
Backend Steps

User profile → aiFeatureVector

Jobs table → each job has aiFeatureVector

Supabase Postgres similarity search:

cosine_similarity(aiFeatureVector)

AI refinement: Gemini creates human-readable ranking explanation

Cache the output → Profile.recommendedJobsCache (optional)

Notification:

“New jobs recommended for you”

🔹 2.3 Cover Letter Auto-Generate (Fill with AI)

Given:

User profile

CV intel

Job intel

Job description

Gemini produces:

Professional, personalized cover letter

Context-aware tone

Uses CV keywords + job requirements

Gated by:
FREE_TIER_AI=on OR user.isPremium = true

🔹 2.4 Employer Applicant Ranking

Triggered when people apply:

For each application:

Compare applicant aiFeatureVector to job aiFeatureVector

Save aiMatchScore

Save aiIntel (why they are a match)

Job table stores sorted list:

aiRecommendedScientists

Employer sees ranked candidates.

Gated by environment variable.

3. NOTIFICATION SYSTEM

Notifications are created in three situations:

1. Job Recommended

When hybrid scoring refreshes.

Notification.create({
  userId,
  type: "job_recommendation",
  title: "New job match found",
  message: "We found new roles that align with your profile."
})

2. Job Application Status

Employer accepts/rejects → send notification.

3. AI Events

CV intel updated

New ranked candidates

Cover letter generated (optional)

4. ENVIRONMENT VARIABLE GATING
process.env.FREE_TIER_AI === "on"


If:

on → all users can use AI

off → only user.isPremium === true

Central helper:
export function canUseAI(user) {
  const free = process.env.FREE_TIER_AI === "on";
  if (free) return true;
  return user.isPremium === true;
}


Used in:

Cover letter generator

CV intel generator

Job recommendations

Applicant ranking

5. FRONTEND LOGIC
Recommended Jobs Page

You call:

/api/recommendations/jobs

Returns:

sorted job IDs

match scores

short AI reasons

Frontend simply lists jobs in that order.

Employer Applicants Page

You call:

/api/job/{id}/ai-candidates

Returns:

ranked applicants

aiMatchScore

aiIntel

Frontend displays:

“Best fit ★”

Reasoning summary

Cover Letter Page

Button: Fill with AI
Call:

POST /api/cover-letter/generate

Returns:

Generated letter text

Frontend inserts into textarea.

6. CACHING STRATEGY (REQUIRED)
Stored only when needed

AI re-runs ONLY when:

CV changes

Job changes

Application created

So page refresh does NOT re-trigger AI.

Cache locations

Profile: aiFeatureVector, cvIntel

Job: aiFeatureVector, aiIntel, aiRecommendedScientists

Application: aiMatchScore, aiIntel

Everything else is database-driven.

7. FILE STORAGE

No changes:

Cloudinary receives PDFs, Docx, images

AI pipeline reads via URL

Returns cleaned text + embeddings

In-App: Supabase Realtime bell icon for alerts (e.g., "Application Received", "Job about to expire").



Email (Transactional): Hostinger SMTP trigger for "Application Submitted" confirmations.

Dependencies: Batch 7 Duration: 2.5 days

📊 Batch 9: Admin Dashboard & Analytics
Goal: Platform oversight and Employer data insights. Context: Addresses "Dashboard Widgets" from Week 2 and general platform management.

Key Features:

Employer Analytics:

Stats widgets: "Total Active Jobs", "Total Applicants", "Pending Applications".

Super Admin Panel:

Table view of all Users and Jobs.

Ability to "Ban User" or "Delete Job" (Content Moderation).

System Health:

Basic error logging view.

Dependencies: Batch 8 Duration: 2 days


Batch 10 - Robust Chat & AI Assistant
1. Overview
A real-time, context-aware messaging system enabling secure, role-based communication between Scientists, Employers, and Collaborators. The module includes an "Admin-level" AI assistant capable of reading project files (RAG), group chat formation, and global message search.

2. Core Features
2.1. Real-Time Messaging & Presence
Infrastructure: Supabase Realtime (WebSockets) for instant delivery.

Presence: "Online" status (green dot) and "Last Seen" timestamps.

Indicators: Ephemeral "Typing..." indicators broadcasted to active participants.

Read Receipts: Unread message counts calculated via lastReadAt timestamps per participant.

2.2. Role-Based Access Control (RBAC)
Employer: Can chat with Applicants (active jobs), Collaborators (active projects), AI, and Admins.

Scientist: Can chat with Employers (hired projects), Referrals (future), AI, and Admins.

Admin: Unrestricted access to chat with any user.

Discovery: A "New Chat" modal filters available contacts based strictly on these rules.

2.3. Group Chats
Creation: Users can select multiple valid contacts to form a new group context.

State: Groups start as fresh threads; 1:1 history is not imported.

2.4. AI Assistant ("Admin Bot")
Capabilities: 1:1 chat interface for every user.

Knowledge Base:

Project Files: RAG (Retrieval-Augmented Generation) using pgvector to query PDF/Doc content in ProjectFiles.

System Info: Answers questions regarding account status and app usage.

Tech: Google Gemini (@google/generative-ai) + Supabase Vector Store.

2.5. Search & Media
Global Search: Full-text search across all accessible conversation histories.

Media: Cloudinary storage for images (optimized previews) and file attachments.

3. Data Model (Prisma Schema)
Add the following models to your schema.prisma. This implementation decouples "Messages" from "Users" to support scalable Group and AI chats.


🎨 Batch 11: Code refinement and fixes
details at docs\initial-docs\Chat Doc.md

🎨 Batch 13: UI Polish & Static Pages
Goal: Finalize the "Premium" look and add missing static pages. Context: Covers Week 5 "In-Lab Mode Preview" and "UI Responsiveness."

Key Features:

In-Lab Mode (Preview Page):

Create a static "Coming Soon" landing page for the In-Lab feature.

Add a "Notify Me" subscription form (saves to leads table) or a basic request form.

Loading & Error States:

Add lazy loading and Skeleton loaders (Shimmer effect) for the Kanban board and Job lists and dashboard components, make sure every compoenent and page that has dynamic content has lazy loading and skeleton loaders.

Custom 404 and 500 Error pages.

Mobile Responsiveness:

Fix Sidebar behavior on mobile (Sheet/Drawer).

Ensure tables scroll horizontally on small screens.

Dependencies: Batch 9 Duration: 2 days

🚀 Batch 14: Testing, Docs & Deployment
Goal: Go live. Context: Covers Week 5 "End-to-End Testing" and "Deployment."

Key Features:

End-to-End (E2E) Smoke Test:

Manual run-through: New User Signup → Post Job → Apply → Hire → Create Project → Release Payment.

Documentation:

Write README.md (Setup instructions).

Record a Loom walkthrough of the core flows (for handoff).

Production Launch:

Deploy to Vercel (Production Branch).

Switch Paystack keys to LIVE mode.

Point Custom Domain (DNS Setup).

Dependencies: Batch 11 Duration: 1.5 days