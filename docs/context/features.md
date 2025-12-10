⚙️ AUTHESCI – OVERALL FEATURES LIST
🧭 1. CORE SYSTEM FEATURES
Feature
Description
✅ Authentication (Supabase Auth)
Email/password signup + login; token-based sessions.
🔐 Role-based Access Control (RBAC)
Separate access for Scientist, Employer, Collaborator, and Admin.
🔁 Session Persistence
Auto login using Supabase session refresh tokens.
🔑 Forgot Password Flow
Password reset via Hostinger email (SMTP).
📧 Email Verification
Optional Supabase email verification or external SMTP confirmation.
🔔 Notifications System
Real-time notifications for project invites, applications, payments, etc.
💬 In-App Messaging
Basic text chat between employer and scientist.
📜 Activity Logging
Tracks uploads, task updates, and project status changes.
🌐 Responsive UI
Fully responsive across desktop, tablet, and mobile.
🎨 Dark/Light Theme Support
Global theme toggle using Tailwind CSS.
🌍 SEO Optimization
Next.js metadata + dynamic page titles/descriptions.
🧩 Component-based Architecture
Reusable components for scalability and maintainability.






🧑‍🔬 2. SCIENTIST FEATURES
Feature
Description
👤 Profile Setup
Input bio, skills, institution, upload CV, publications.
🤖 AI Job Suggestions
Auto-recommend jobs based on listed skills and experience.
🔍 Job Marketplace
Browse jobs using filters (keyword, job type, specialization).
📄 Job Application System
Submit application with pre-filled data and cover letter.
🕒 Application Tracking
View job statuses — Submitted, Under Review, Rejected.
🧪 Project Workspace Access
Join or create research projects.
🧱 Task Management (Kanban)
Create, assign, and mark tasks as complete.
📁 File Uploads
Upload datasets, images, PDFs, and CSVs (Cloudflare R2/Supabase storage).
👥 Collaboration Tools
Invite others to upload or edit project materials.
🕓 Timestamped Activity Log
All edits, uploads, and updates are tracked.
💬 Messaging/Comment Thread
Communicate with other collaborators.
💰 Escrow & Payment Confirmation
Receive payments from employers once project is approved.


💼 3. EMPLOYER FEATURES
Feature
Description
🏠 Employer Dashboard
Overview of jobs posted, applicants, and current projects.
✍️ Create Job Post
Add title, description, job type, salary range, and location.








👀 View Applicants
List of applicants with CV, cover letter, and status.
🗃️ Shortlist / Reject / Contact
Manage candidate stages.
💬 In-platform Chat
Contact shortlisted candidates directly.
🤝 Hire & Fund Project (Escrow)
Initiate funding and project start.
💳 Payment Flow
Handle payment via Flutterwave/Paystack (or manual reference).
📊 Project Status Overview
Track progress, completion, and fund release.


🧱 4. PROJECT COLLABORATION FEATURES
Feature
Description
🧪 Project Creation
Scientists or employers can create new projects.
🧩 Project Roles
Owner, Collaborator, Employer.
📁 File Management
Upload and view project files with metadata (name, uploader, date).
📝 Task Management Board
Kanban-style board for tasks with drag-and-drop.
🔗 Invite Collaborators
Send email or secure link invites.
⚙️ Permission Levels
view, upload, edit, or manage.
🧠 Project Questions (NEW)
Creator can add custom questions for applicants before joining.
📋 Project Question Responses
Store applicant answers with each application.
🕓 Activity Feed
See who uploaded or edited what and when.
🧾 Progress Metrics
Tasks completed %, collaborator count, file count.
🔐 Access Control
Restricted project access for authorized members only.


💰 5. PAYMENT & ESCROW FEATURES
Feature
Description
💵 Escrow Funding
Employer funds a project before work starts.
🧾 Transaction Tracking
Each payment logged with reference ID.
📅 Status Flow
Pending → Funded → Released → Completed.
🔐 Manual Verification Option
Admin can manually confirm payments if done offline.
📨 Payment Notifications
Real-time alert when a payment is made or released.
💳 Payment Gateway (Localized)
Integrate Flutterwave or Paystack for Nigerian users.
📈 Admin Analytics
Future enhancement – monitor payment activity and volume.


🧰 6. SYSTEM & EXPERIENCE FEATURES
Feature
Description
⚡ API Integration Layer
REST/Edge functions via Supabase for jobs, projects, and tasks.
📦 File Storage Handling
Automatically link uploads to project_files table.
🪄 Reusable UI Components
Forms, modals, inputs, toasts, alerts (shadcn/ui or custom).
🧭 Routing Architecture
Next.js App Router with layouts per role (Scientist, Employer).
🕹️ Navigation Components
Sidebar, Navbar, Pagination, Tabs.
🔍 Search & Filtering
Real-time job/project search via Supabase queries.
🗂️ Form Validation
Zod/React Hook Form validations with required fields mapping.
📲 Responsiveness
100% mobile-friendly using Tailwind’s responsive utilities.
🧠 AI Functionality (Extendable)
Job recommendation model and contextual search.




🔄 Auto Refresh / SWR Hooks
Real-time sync of jobs, notifications, and chat.
🔊 Toast & Alert System
Success/failure feedback for user actions.
🧩 Email Service
SMTP via Hostinger + Nodemailer API route for password resets, invitations.
🧠 Caching Strategy
Next.js ISR for job listings and project previews.
🧱 Security
RLS (Row Level Security) in Supabase, password hashing, and safe user queries.


