# Batch 5: Job Marketplace (Full Loop)

## 1. Overview
**Goal:** Implement the complete job lifecycle: posting, browsing, applying, and managing applications. This connects the two primary user roles (Scientist and Employer) in a core value loop.

**Short Description:**
Employers can create, edit, and manage job postings. Scientists can browse, filter, and apply for these jobs. Employers can then review applicants, shortlist, or reject them.

## 2. Goals & Metrics
-   **Core Goal:** Enable a seamless "Post -> Apply -> Review" workflow.
-   **Success Metrics:**
    -   Successful job creation by Employers (including payment flow via Paystack Test Mode).
    -   Successful application submission by Scientists (including Resume upload via Cloudinary).
    -   Accurate status updates (Applied, Shortlisted, Rejected).
    -   Zero critical errors in the application flow.

## 3. Acceptance Criteria (User Stories)

### 3.1 Employer - Post a Job
-   **GIVEN** I am an authenticated Employer
-   **WHEN** I navigate to "Post New Job" and fill out the form (Title, Description, Requirements, Location, Salary, Type)
-   **THEN** A new Job record is created.
-   **IF** the job is sponsored/paid:
    -   **THEN** I am redirected to the Paystack checkout (Test Mode).
    -   **WHEN** Payment is successful.
    -   **THEN** Job status becomes `ACTIVE` and I am redirected to "Manage Jobs".
-   **ELSE** (Free posting):
    -   **THEN** Job status becomes `ACTIVE` (or `DRAFT`) immediately.

### 3.2 Scientist - Browse Jobs
-   **GIVEN** I am an authenticated Scientist (or unauthenticated visitor for public board)
-   **WHEN** I visit the Job Marketplace
-   **THEN** I see a list of active job postings.
-   **AND** I can filter by Job Type (Remote, Hybrid, On-site) or search by keyword.

### 3.3 Scientist - Apply for Job
-   **GIVEN** I am an authenticated Scientist with a completed profile
-   **WHEN** I view a Job Detail page and click "Apply"
-   **THEN** I see an application form pre-filled with my profile data.
-   **WHEN** I upload my Resume (handled via Cloudinary) and add a cover letter
-   **AND** I submit the form
-   **THEN** An Application record is created.

### 3.4 Employer - Manage Applications
-   **GIVEN** I am an Employer with active jobs
-   **WHEN** I view the "Applicants" list for a specific job
-   **THEN** I see a list of Scientists who applied.
-   **WHEN** I select an applicant
-   **THEN** I can view their details (including Cloudinary-hosted Resume) and change their status to `SHORTLISTED` or `REJECTED`.

## 4. UX & Template References
Refer to `authesci-app/templates/wowdash/src/html/pages/` for UI structure.

| Feature | Route | Template Reference | Notes |
| :--- | :--- | :--- | :--- |
| **Job Board** | `/jobs` | `card.html` / `list.html` | Grid of job cards. |
| **Job Details** | `/jobs/[id]` | `view-details.html` | Detailed view with "Apply" CTA. |
| **Post Job** | `/employer/jobs/new` | `form.html` | Standard form layout. |
| **Manage Jobs** | `/employer/jobs` | `table-basic.html` | List of posted jobs with status. |
| **Apply** | `/jobs/[id]/apply` | `wizard.html` or `form.html` | Simple form or multi-step if needed. |
| **View Applicants** | `/employer/jobs/[id]/applicants` | `users-list.html` | List of applicants. |

## 5. Data Model (Reference Only)
**Note:** Schema changes have already been applied. No migration needed.

```prisma
// prisma/schema.prisma (Already Implemented)

model Job {
  id          String   @id @default(uuid())
  employerId  String   @map("employer_id")
  employer    Profile  @relation("JobsPosted", fields: [employerId], references: [id], onDelete: Cascade)
  title       String
  description String
  requirements String[] @default([])
  category    String?
  jobType     JobType  @map("job_type")
  location    String?
  salaryRange String?  @map("salary_range")
  status      JobStatus @default(DRAFT)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  applications Application[]
}

model Application {
  id          String   @id @default(uuid())
  jobId       String   @map("job_id")
  job         Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  applicantId String   @map("applicant_id")
  applicant   Profile  @relation("Applications", fields: [applicantId], references: [id], onDelete: Cascade)
  coverLetter String?  @map("cover_letter")
  resumeUrl   String?  @map("resume_url")
  status      ApplicationStatus @default(PENDING)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([jobId, applicantId])
}
```

## 6. Components List

### Server Components
-   `JobBoard` (fetches list of active jobs)
-   `JobDetail` (fetches single job data)
-   `EmployerJobList` (fetches jobs for current employer)
-   `ApplicantList` (fetches applications for a job)

### Client Components
-   `JobCard` (display summary, handles "Save" interaction)
-   `JobForm` (create/edit job)
-   `ApplicationForm` (submit application, handles Cloudinary upload)
-   `StatusBadge` (visual indicator for Job/Application status)
-   `ApplicantActionMenu` (Shortlist/Reject actions)

## 7. Implementation Plan
1.  **Environment Setup:**
    -   Configure Paystack (Test Mode) keys in `.env.local`.
    -   Configure Cloudinary keys in `.env.local`.
2.  **Server Actions:**
    -   `createJob`, `updateJob`, `deleteJob` in `actions/jobs.ts` (integrate Paystack initialization if needed).
    -   `applyForJob`, `updateApplicationStatus` in `actions/applications.ts`.
    -   Ensure file upload action supports Cloudinary.
3.  **Employer Pages:** Implement "Post Job" and "Manage Jobs" pages.
4.  **Public Pages:** Implement "Job Board" and "Job Details".
5.  **Application Flow:** Implement "Apply" page and connection to Server Actions.
6.  **Applicant Management:** Implement view for Employers to manage candidates.

## 8. MCP Tools & Resources (Option B)
Use these tools during implementation:

-   **`task-master-ai` (MCP):** Use to track progress of individual sub-tasks.
-   **`context7` (MCP):** Use if you need to look up specific Shadcn component docs.

## 9. Risks & Dependencies
-   **Dependency:** Batch 4 (Profile Setup) must be complete so Scientists have profiles to apply with.
-   **Risk:** Paystack integration needs to handle callbacks/webhooks correctly to update job status.
-   **Risk:** Cloudinary upload widget or API needs to be securely configured.
