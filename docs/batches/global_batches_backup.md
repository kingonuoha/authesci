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

🔐 Batch 2: Authentication & Session Management
Goal: Implement secure, role-based authentication with Supabase Auth + Prisma.
Sub-modules:
Supabase Auth Setup:

Configure Supabase Auth in Next.js App Router (@supabase/ssr)
Create auth utilities:

lib/supabase/server.ts (Server Component auth)
lib/supabase/client.ts (Client Component auth)
lib/supabase/middleware.ts (Route protection)



Prisma Schema for Auth:
prisma// prisma/schema.prisma
model Profile {
  id          String   @id @default(uuid())
  userId      String   @unique // Supabase auth.users.id
  email       String   @unique
  fullName    String
  role        Role     @default(SCIENTIST)
  bio         String?
  skills      String[]
  experience  String?
  cvUrl       String?
  avatarUrl   String?
  institution String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  jobs         Job[]         @relation("EmployerJobs")
  applications Application[]
  projects     Project[]     @relation("ProjectCreator")
  collaborations Collaborator[]
}

enum Role {
  SCIENTIST
  EMPLOYER
  COLLABORATOR
  ADMIN
}
Auth Pages (App Router):

app/(auth)/login/page.tsx - Server Component with Client form
app/(auth)/signup/page.tsx - Server Component with Client form
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
app/(auth)/verify-email/page.tsx

Auth Components (Client Components):

components/auth/LoginForm.tsx ("use client")
components/auth/SignUpForm.tsx ("use client")
components/auth/RoleSelector.tsx ("use client")

Server Actions for Auth:
typescript// app/actions/auth.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = createServerClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as "SCIENTIST" | "EMPLOYER";
  
  // Create Supabase user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Create Prisma profile
  await prisma.profile.create({
    data: {
      userId: data.user!.id,
      email,
      fullName,
      role,
    },
  });
  
  redirect("/dashboard");
}
Middleware for Route Protection:
typescript// middleware.ts
import { createServerClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

**Email Integration (Hostinger SMTP):**
- Create API route: `app/api/mail/route.ts`
- Use Nodemailer with Hostinger SMTP
- Email templates for:
  - Welcome email
  - Password reset
  - Email verification

**Toast Notifications:**
- Use Shadcn/UI `toast` component
- Global toast provider in `app/layout.tsx`

**Dependencies:** Batch 1

**Duration:** 2 days

---

### 🧭 **Batch 3: Dashboard Layouts & Navigation**

**Goal:** Build role-aware dashboard structures with Server Components + Client interactivity.

**Sub-modules:**

**Layout Structure (App Router):**
```
app/
├── (auth)/
│   ├── login/
│   └── signup/
└── (dashboard)/
    ├── layout.tsx (Dashboard layout with Sidebar + Navbar)
    ├── scientist/
    │   └── page.tsx (Scientist dashboard)
    ├── employer/
    │   └── page.tsx (Employer dashboard)
    └── collaborator/
        └── page.tsx (Collaborator dashboard)
Dashboard Layout (Server Component):
typescript// app/(dashboard)/layout.tsx
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user profile with Prisma
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col">
        <Navbar user={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
Dashboard Components:

Sidebar.tsx (Client Component - navigation state)
Navbar.tsx (Client Component - user menu, theme toggle)
StatWidget.tsx (Server Component - fetches data)
RecentActivity.tsx (Server Component)
EmptyDashboard.tsx (Server Component)

Role-Based Routing:

Use Prisma to check user role
Redirect to appropriate dashboard
Role switcher for users with multiple roles (Client Component)

Theme Toggle (Client Component):
typescript// components/dashboard/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
Onboarding Flow:

Check profile completion status
Redirect incomplete profiles to /onboarding
Multi-step onboarding form (Client Component)

Dependencies: Batch 1.5, Batch 2
Duration: 1.5 days

👤 Batch 4: Profile Setup & Management
Goal: Enable users to complete profiles using Server Actions + Prisma.
Prisma Schema Extension:
prismamodel Profile {
  // ... existing fields
  publications String[]
  certifications String[]
  completionScore Int @default(0)
}
Server Actions for Profile:
typescript// app/actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error("Unauthorized");
  
  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      bio: formData.get("bio") as string,
      skills: (formData.get("skills") as string).split(","),
      experience: formData.get("experience") as string,
      institution: formData.get("institution") as string,
    },
  });
  
  revalidatePath("/profile");
  return profile;
}
File Upload (Cloudflare R2 via API Route):
typescript// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createServerClient } from "@/lib/supabase/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `cv/${session.user.id}/${Date.now()}-${file.name}`;
  
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );
  
  const url = `${process.env.R2_PUBLIC_URL}/${key}`;
  return NextResponse.json({ url });
}
Profile Pages:

app/(dashboard)/profile/page.tsx (Server Component - displays profile)
app/(dashboard)/profile/edit/page.tsx (Server Component with Client form)

Profile Components:

ProfileForm.tsx (Client Component - form with validation)
SkillsInput.tsx (Client Component - taggable input)
FileUploader.tsx (Client Component - drag & drop)
ProfileProgress.tsx (Client Component - progress bar)

Dependencies: Batch 3
Duration: 1.5 days

Week 2: Core Features + Polish
💼 Batch 5: Job Marketplace (Full Loop) ⭐ MERGED
Prisma Schema:
prismamodel Job {
  id            String   @id @default(uuid())
  employerId    String
  employer      Profile  @relation("EmployerJobs", fields: [employerId], references: [id])
  title         String
  description   String
  requirements  String[]
  category      String?
  jobType       JobType
  location      String?
  salaryRange   String?
  status        JobStatus @default(DRAFT)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  applications Application[]
}

enum JobType {
  REMOTE
  HYBRID
  ON_SITE
  CONTRACT
}

enum JobStatus {
  DRAFT
  PENDING_PAYMENT
  ACTIVE
  CLOSED
}

model Application {
  id            String   @id @default(uuid())
  jobId         String
  job           Job      @relation(fields: [jobId], references: [id])
  applicantId   String
  applicant     Profile  @relation(fields: [applicantId], references: [id])
  coverLetter   String?
  resumeUrl     String?
  status        ApplicationStatus @default(PENDING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum ApplicationStatus {
  PENDING
  SHORTLISTED
  REJECTED
  ACCEPTED
}
Server Actions:
typescript// app/actions/jobs.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJob(formData: FormData) {
  // ... create job logic with Prisma
  revalidatePath("/employer/jobs");
}

export async function applyForJob(jobId: string, formData: FormData) {
  // ... application logic with Prisma
  revalidatePath(`/jobs/${jobId}`);
}
Pages:

app/(dashboard)/jobs/page.tsx (Server Component - job listings)
app/(dashboard)/jobs/[id]/page.tsx (Server Component - job details)
app/(dashboard)/jobs/[id]/apply/page.tsx (Client form)
app/(dashboard)/employer/jobs/new/page.tsx (Client form)
app/(dashboard)/employer/applicants/page.tsx (Server Component)

Dependencies: Batch 4
Duration: 2.5 days

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