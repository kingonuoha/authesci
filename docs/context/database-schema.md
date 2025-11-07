# Authesci Database Schema Reference

This document serves as the definitive reference for the Authesci database schema, detailing all Prisma models, relationships, and constraints as defined in `prisma/schema.prisma`.

## 1. Overview

The Authesci database is designed to support a collaborative platform connecting scientists, employers, and collaborators. It manages user profiles, job listings, applications, projects, payments, and notifications. The schema is built using Prisma ORM, providing type-safe interactions with a PostgreSQL database.

## 2. Enums

Enums define a set of allowed values for specific fields, ensuring data consistency.

### Role
Defines the roles a user can have within the platform.
- `SCIENTIST`
- `EMPLOYER`
- `COLLABORATOR`
- `ADMIN`

### JobType
Specifies the type of employment for a job listing.
- `REMOTE`
- `HYBRID`
- `ON_SITE`
- `CONTRACT`

### JobStatus
Indicates the current status of a job listing.
- `DRAFT`
- `PENDING_PAYMENT`
- `ACTIVE`
- `CLOSED`

### ApplicationStatus
Describes the status of a job application.
- `PENDING`
- `SHORTLISTED`
- `REJECTED`
- `ACCEPTED`

### ProjectStatus
Represents the current status of a project.
- `ACTIVE`
- `COMPLETED`
- `ARCHIVED`

### TaskStatus
Indicates the status of a task within a project.
- `OPEN`
- `IN_PROGRESS`
- `DONE`

### PaymentStatus
Describes the status of a payment.
- `PENDING`
- `FUNDED`
- `RELEASED`
- `CANCELLED`

### CollaboratorStatus
Indicates the status of a collaborator in a project.
- `ACTIVE`
- `REMOVED`
- `LEFT`

## 3. Model Definitions

### Profile
Represents a user profile, storing personal and professional information.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the profile.
- `userId`: `String` (`@unique`) - Foreign key to the authentication system user ID.
- `email`: `String` (`@unique`) - User's email address.
- `fullName`: `String` (`@map("full_name")`) - Full name of the user.
- `role`: `Role` - User's role (e.g., SCIENTIST, EMPLOYER).
- `bio`: `String?` - User's biography.
- `skills`: `String[]` (`@default([])`) - Array of skills.
- `experience`: `String?` - User's experience details.
- `cvUrl`: `String?` (`@map("cv_url")`) - URL to the user's CV.
- `avatarUrl`: `String?` (`@map("avatar_url")`) - URL to the user's avatar image.
- `institution`: `String?` - User's affiliated institution.
- `publications`: `String[]` (`@default([])`) - Array of publication references.
- `certifications`: `String[]` (`@default([])`) - Array of certifications.
- `completionScore`: `Int` (`@default(0) @map("completion_score")`) - Profile completion score.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.
- `updatedAt`: `DateTime` (`@updatedAt @map("updated_at")`) - Timestamp of last update.

**Relationships:**
- `jobsPosted`: `Job[]` (`@relation("JobsPosted")`) - Jobs posted by this profile (if employer).
- `applications`: `Application[]` (`@relation("Applications")`) - Applications made by this profile (if scientist).
- `projectsCreated`: `Project[]` (`@relation("ProjectsCreated")`) - Projects created by this profile.
- `collaborations`: `Collaborator[]` (`@relation("Collaborations")`) - Projects this profile is collaborating on.
- `notifications`: `Notification[]` (`@relation("Notifications")`) - Notifications for this profile.
- `projectFiles`: `ProjectFile[]` (`@relation("ProjectFiles")`) - Files uploaded by this profile.
- `tasks`: `Task[]` (`@relation("Tasks")`) - Tasks assigned to this profile.
- `projectActivities`: `ProjectActivity[]` (`@relation("ProjectActivities")`) - Activities performed by this profile in projects.
- `paymentsAsEmployer`: `Payment[]` (`@relation("PaymentsAsEmployer")`) - Payments made by this profile (if employer).
- `paymentsAsScientist`: `Payment[]` (`@relation("PaymentsAsScientist")`) - Payments received by this profile (if scientist).

### Job
Represents a job listing posted by an employer.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the job.
- `employerId`: `String` (`@map("employer_id")`) - ID of the employer who posted the job.
- `title`: `String` - Job title.
- `description`: `String` - Job description.
- `requirements`: `String[]` (`@default([])`) - Array of job requirements.
- `category`: `String?` - Job category.
- `jobType`: `JobType` (`@map("job_type")`) - Type of job (e.g., REMOTE, HYBRID).
- `location`: `String?` - Job location.
- `salaryRange`: `String?` (`@map("salary_range")`) - Salary range for the job.
- `status`: `JobStatus` (`@default(DRAFT)`) - Current status of the job listing.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.
- `updatedAt`: `DateTime` (`@updatedAt @map("updated_at")`) - Timestamp of last update.

**Relationships:**
- `employer`: `Profile` (`@relation("JobsPosted", fields: [employerId], references: [id], onDelete: Cascade)`) - The employer profile that posted this job.
- `applications`: `Application[]` - Applications for this job.

### Application
Represents a job application submitted by a scientist.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the application.
- `jobId`: `String` (`@map("job_id")`) - ID of the job being applied for.
- `applicantId`: `String` (`@map("applicant_id")`) - ID of the scientist applying.
- `coverLetter`: `String?` (`@map("cover_letter")`) - Applicant's cover letter.
- `resumeUrl`: `String?` (`@map("resume_url")`) - URL to the applicant's resume.
- `status`: `ApplicationStatus` (`@default(PENDING)`) - Current status of the application.
- `shortlistedAt`: `DateTime?` (`@map("shortlisted_at")`) - Timestamp when the application was shortlisted.
- `rejectedAt`: `DateTime?` (`@map("rejected_at")`) - Timestamp when the application was rejected.
- `contactedAt`: `DateTime?` (`@map("contacted_at")`) - Timestamp when the applicant was contacted.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.
- `updatedAt`: `DateTime` (`@updatedAt @map("updated_at")`) - Timestamp of last update.

**Relationships:**
- `job`: `Job` (`@relation(fields: [jobId], references: [id], onDelete: Cascade)`) - The job associated with this application.
- `applicant`: `Profile` (`@relation("Applications", fields: [applicantId], references: [id], onDelete: Cascade)`) - The scientist profile who submitted this application.

**Constraints:**
- `@@unique([jobId, applicantId])` - Ensures a scientist can only apply to a specific job once.

### Project
Represents a research project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the project.
- `creatorId`: `String` (`@map("creator_id")`) - ID of the user who created the project.
- `title`: `String` - Project title.
- `description`: `String` - Project description.
- `budget`: `Decimal?` (`@db.Decimal(10, 2)`) - Project budget.
- `status`: `ProjectStatus` (`@default(ACTIVE)`) - Current status of the project.
- `hasQuestions`: `Boolean` (`@default(false) @map("has_questions")`) - Indicates if the project has associated questions.
- `deletedAt`: `DateTime?` (`@map("deleted_at")`) - Timestamp if the project was soft-deleted.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.
- `updatedAt`: `DateTime` (`@updatedAt @map("updated_at")`) - Timestamp of last update.

**Relationships:**
- `creator`: `Profile` (`@relation("ProjectsCreated", fields: [creatorId], references: [id], onDelete: Cascade)`) - The profile that created this project.
- `collaborators`: `Collaborator[]` - Collaborators on this project.
- `files`: `ProjectFile[]` - Files associated with this project.
- `tasks`: `Task[]` - Tasks within this project.
- `questions`: `ProjectQuestion[]` - Questions related to this project.
- `activities`: `ProjectActivity[]` - Activities performed within this project.
- `payments`: `Payment[]` - Payments associated with this project.

### Collaborator
Represents a user collaborating on a project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the collaboration.
- `projectId`: `String` (`@map("project_id")`) - ID of the project.
- `userId`: `String` (`@map("user_id")`) - ID of the collaborating user.
- `role`: `String` - Role of the collaborator within the project.
- `permissions`: `String[]` (`@default(["view"])`) - Array of permissions for the collaborator.
- `status`: `CollaboratorStatus` (`@default(ACTIVE)`) - Status of the collaboration.
- `joinedAt`: `DateTime` (`@default(now()) @map("joined_at")`) - Timestamp when the collaborator joined.

**Relationships:**
- `project`: `Project` (`@relation(fields: [projectId], references: [id], onDelete: Cascade)`) - The project this collaboration belongs to.
- `user`: `Profile` (`@relation("Collaborations", fields: [userId], references: [id], onDelete: Cascade)`) - The user profile involved in this collaboration.

**Constraints:**
- `@@unique([projectId, userId])` - Ensures a user can only be a collaborator on a specific project once.

### ProjectFile
Represents a file uploaded to a project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the file.
- `projectId`: `String` (`@map("project_id")`) - ID of the project the file belongs to.
- `uploadedBy`: `String` (`@map("uploaded_by")`) - ID of the user who uploaded the file.
- `fileName`: `String` (`@map("file_name")`) - Name of the file.
- `fileUrl`: `String` (`@map("file_url")`) - URL to the stored file.
- `fileType`: `String` (`@map("file_type")`) - Type of the file (e.g., 'image/png').
- `fileSize`: `Int?` - Size of the file in bytes.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of upload.

**Relationships:**
- `project`: `Project` (`@relation(fields: [projectId], references: [id], onDelete: Cascade)`) - The project this file is associated with.
- `uploader`: `Profile` (`@relation("ProjectFiles", fields: [uploadedBy], references: [id], onDelete: Cascade)`) - The profile that uploaded this file.

### Task
Represents a task within a project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the task.
- `projectId`: `String` (`@map("project_id")`) - ID of the project the task belongs to.
- `assignedTo`: `String?` (`@map("assigned_to")`) - ID of the user assigned to the task.
- `title`: `String` - Task title.
- `description`: `String?` - Task description.
- `status`: `TaskStatus` (`@default(OPEN)`) - Current status of the task.
- `dueDate`: `DateTime?` (`@map("due_date")`) - Due date for the task.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.
- `updatedAt`: `DateTime` (`@updatedAt @map("updated_at")`) - Timestamp of last update.

**Relationships:**
- `project`: `Project` (`@relation(fields: [projectId], references: [id], onDelete: Cascade)`) - The project this task belongs to.
- `assignee`: `Profile?` (`@relation("Tasks", fields: [assignedTo], references: [id])`) - The profile assigned to this task.

### ProjectQuestion
Represents a question associated with a project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the question.
- `projectId`: `String` (`@map("project_id")`) - ID of the project the question belongs to.
- `questionText`: `String` (`@map("question_text")`) - The text of the question.
- `required`: `Boolean` - Indicates if the question is required.
- `orderIndex`: `Int?` (`@map("order_index")`) - Display order of the question.

**Relationships:**
- `project`: `Project` (`@relation(fields: [projectId], references: [id], onDelete: Cascade)`) - The project this question is associated with.

### ProjectActivity
Logs activities performed within a project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the activity log.
- `projectId`: `String` (`@map("project_id")`) - ID of the project where the activity occurred.
- `userId`: `String` (`@map("user_id")`) - ID of the user who performed the activity.
- `action`: `String` - Description of the action performed.
- `metadata`: `Json?` (`@db.JsonB`) - Additional JSON metadata about the activity.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of the activity.

**Relationships:**
- `project`: `Project` (`@relation(fields: [projectId], references: [id], onDelete: Cascade)`) - The project this activity belongs to.
- `user`: `Profile` (`@relation("ProjectActivities", fields: [userId], references: [id], onDelete: Cascade)`) - The user who performed this activity.

### Payment
Represents a payment transaction within a project.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the payment.
- `projectId`: `String` (`@map("project_id")`) - ID of the project the payment is for.
- `employerId`: `String` (`@map("employer_id")`) - ID of the employer making the payment.
- `scientistId`: `String` (`@map("scientist_id")`) - ID of the scientist receiving the payment.
- `amount`: `Decimal` (`@db.Decimal(10, 2)`) - Amount of the payment.
- `status`: `PaymentStatus` (`@default(PENDING)`) - Current status of the payment.
- `reference`: `String?` (`@unique`) - Optional payment reference/transaction ID.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.
- `updatedAt`: `DateTime` (`@updatedAt @map("updated_at")`) - Timestamp of last update.

**Relationships:**
- `project`: `Project` (`@relation(fields: [projectId], references: [id], onDelete: Cascade)`) - The project this payment is associated with.
- `employer`: `Profile` (`@relation("PaymentsAsEmployer", fields: [employerId], references: [id], onDelete: Cascade)`) - The employer profile making this payment.
- `scientist`: `Profile` (`@relation("PaymentsAsScientist", fields: [scientistId], references: [id], onDelete: Cascade)`) - The scientist profile receiving this payment.

### Notification
Represents a notification for a user.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the notification.
- `userId`: `String` (`@map("user_id")`) - ID of the user the notification is for.
- `type`: `String` - Type of notification (e.g., 'job_application', 'payment_received').
- `message`: `String` - The notification message.
- `read`: `Boolean` (`@default(false)`) - Indicates if the notification has been read.
- `metadata`: `Json?` (`@db.JsonB`) - Additional JSON metadata for the notification.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.

**Relationships:**
- `user`: `Profile` (`@relation("Notifications", fields: [userId], references: [id], onDelete: Cascade)`) - The user profile this notification belongs to.

### Subscription
Represents an email subscription.
- `id`: `String` (`@id @default(uuid())`) - Unique identifier for the subscription.
- `email`: `String` (`@unique`) - Subscriber's email address.
- `source`: `String?` - Source of the subscription.
- `createdAt`: `DateTime` (`@default(now()) @map("created_at")`) - Timestamp of creation.

**Constraints:**
- `@@unique([email])` - Ensures an email address can only be subscribed once.

## 4. Relationships Overview

- **Profile to Job (JobsPosted):** One-to-Many (Employer posts multiple jobs)
- **Profile to Application (Applications):** One-to-Many (Scientist makes multiple applications)
- **Profile to Project (ProjectsCreated):** One-to-Many (User creates multiple projects)
- **Profile to Collaborator (Collaborations):** One-to-Many (User can collaborate on multiple projects)
- **Profile to Notification (Notifications):** One-to-Many (User receives multiple notifications)
- **Profile to ProjectFile (ProjectFiles):** One-to-Many (User uploads multiple project files)
- **Profile to Task (Tasks):** One-to-Many (User can be assigned multiple tasks)
- **Profile to ProjectActivity (ProjectActivities):** One-to-Many (User performs multiple project activities)
- **Profile to Payment (PaymentsAsEmployer):** One-to-Many (Employer makes multiple payments)
- **Profile to Payment (PaymentsAsScientist):** One-to-Many (Scientist receives multiple payments)

- **Job to Application:** One-to-Many (Job receives multiple applications)

- **Project to Collaborator:** One-to-Many (Project has multiple collaborators)
- **Project to ProjectFile:** One-to-Many (Project has multiple files)
- **Project to Task:** One-to-Many (Project has multiple tasks)
- **Project to ProjectQuestion:** One-to-Many (Project has multiple questions)
- **Project to ProjectActivity:** One-to-Many (Project has multiple activities)
- **Project to Payment:** One-to-Many (Project has multiple payments)

## 5. Naming Conventions

- **Models:** PascalCase (e.g., `Profile`, `Job`)
- **Table Names:** `snake_case` (e.g., `profiles`, `jobs`) - achieved using `@@map("table_name")`
- **Fields:** `camelCase` (e.g., `fullName`, `createdAt`)
- **Column Names:** `snake_case` (e.g., `full_name`, `created_at`) - achieved using `@map("column_name")`

## 6. Key Patterns

- **UUID Primary Keys:** All models use `String` with `@id @default(uuid())` for distributed and globally unique identifiers.
- **Soft Deletes:** The `Project` model includes a `deletedAt: DateTime?` field to support soft deletion, allowing records to be marked as deleted rather than permanently removed.
- **Cascading Deletes:** Many relationships are configured with `onDelete: Cascade`, ensuring that when a parent record is deleted, all related child records are also automatically deleted (e.g., deleting a `Profile` deletes their `JobsPosted`, `Applications`, etc.).
- **Unique Constraints:** `@@unique` attributes are used to enforce uniqueness on specific fields or combinations of fields (e.g., `email` for `Profile`, `[jobId, applicantId]` for `Application`).
