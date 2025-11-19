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
🧩 Batch 1: Project Setup & Template Integration ✅ (Current - In Progress)
Goal: Establish clean codebase, environments, and UI foundation.
Sub-modules:

✅ Next.js 16 + TypeScript + Tailwind + Shadcn/UI setup
✅ WowDash template integration (dist/ and html/)
✅ Static asset management (public/assets)
✅ Supabase client configuration (@supabase/ssr for App Router)
✅ Design token extraction and Tailwind theme customization
⏳ Prisma setup:

Install Prisma (npm install prisma @prisma/client)
Initialize Prisma (npx prisma init)
Configure DATABASE_URL (Supabase connection string)
Generate initial Prisma schema (profiles, jobs, applications tables)
Run first migration (npx prisma migrate dev)


⏳ Component conversion workflow documentation
⏳ ESLint + Prettier configuration
⏳ Git repository initialization

Next.js Specific Dependencies:
json{
  "dependencies": {
    "next": "^16.0.0",
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

Add Prisma integration
Complete template prototype pages
Finalize documentation


🎨 Batch 1.5: Template Component Library ⭐ NEW
Goal: Convert WowDash html/ snippets into reusable Next.js Server/Client Components.
Sub-modules:

Extract and convert core UI components:

JobCard.tsx (Client Component - has onClick handlers)
ProjectCard.tsx (Client Component - interactive)
StatWidget.tsx (Server Component - displays stats)
Sidebar.tsx (Client Component - navigation state)
Navbar.tsx (Client Component - user menu, notifications)
ApplicationCard.tsx (Client Component - status actions)
TaskCard.tsx (Client Component - drag & drop)
EmptyState.tsx (Server Component - static placeholder)
LoadingSkeleton.tsx (Server Component - loading states)



Next.js Specific Considerations:

Use "use client" directive for interactive components
Keep Server Components as default for static content
Use Next.js <Image> component for optimized images
Use Next.js <Link> for internal navigation
Implement proper TypeScript interfaces for all props

Component Structure Example:
typescript// components/modules/JobCard.tsx
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
UI Behaviors (Next.js Compatible):

Use Shadcn/UI components for complex interactions:

DropdownMenu for user menus
Dialog for modals
Sheet for mobile sidebars
Tabs for tabbed interfaces
Select for dropdowns


Avoid any jQuery or vanilla DOM manipulation
Use React hooks (useState, useEffect) for state management
Use useRouter from next/navigation for programmatic navigation

Dependencies: Batch 1
Duration: 1 day

🔐 Batch 2: Authentication & Session Management ✅ (Completed)
Goal: Implement secure, role-based authentication with Supabase Auth + Prisma.
Status: Completed. The implementation details below reflect the final architecture.

Key Architectural Decisions:
- Centralized UI: A single `AuthCard.tsx` component is used for all auth forms to ensure consistency.
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

🧪 Batch 6: Project Workspace
Prisma Schema:
prismamodel Project {
  id              String   @id @default(uuid())
  creatorId       String
  creator         Profile  @relation("ProjectCreator", fields: [creatorId], references: [id])
  title           String
  description     String
  budget          Decimal?
  status          ProjectStatus @default(ACTIVE)
  hasQuestions    Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  collaborators   Collaborator[]
  files           ProjectFile[]
  tasks           Task[]
  questions       ProjectQuestion[]
  activities      ProjectActivity[]
}

model Task {
  id          String   @id @default(uuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  assignedTo  String?
  title       String
  description String?
  status      TaskStatus @default(OPEN)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TaskStatus {
  OPEN
  IN_PROGRESS
  DONE
}
File Upload with Server Actions:
typescript// app/actions/files.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProjectFile(projectId: string, fileUrl: string, fileName: string) {
  const file = await prisma.projectFile.create({
    data: {
      projectId,
      fileName,
      fileUrl,
      fileType: fileName.split(".").pop() || "unknown",
      uploadedBy: "user-id", // Get from session
    },
  });
  
  revalidatePath(`/projects/${projectId}`);
  return file;
}
Components:

Use @dnd-kit/core for Kanban board (Next.js compatible)
Server Components for data fetching
Client Components for drag & drop

Dependencies: Batch 5
Duration: 2 days

💰 Batch 7: Payment & Escrow
Paystack Integration (API Route):
typescript// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { amount, email, projectId } = await request.json();
  
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Convert to kobo
      metadata: { projectId },
    }),
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
Dependencies: Batch 5, Batch 6
Duration: 1.5 days

🧠 Batch 8: Notifications & AI
Supabase Realtime (Server Component):
typescript// app/(dashboard)/notifications/page.tsx
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });
  
  return <NotificationList notifications={notifications} />;
}
Dependencies: Batch 7
Duration: 1.5 days

🎨 Batch 9: UI/UX Polish
Next.js Specific:

Use <Suspense> for loading states
Implement loading.tsx files
Use error.tsx for error boundaries
Optimize images with next/image

Dependencies: Batch 8
Duration: 1.5 days

🚀 Batch 10: Deployment
Deployment Checklist:

Prisma migrations on production database
Supabase production project setup
Vercel environment variables
Cloudflare R2 production bucket

Dependencies: Batch 9
Duration: 1 day