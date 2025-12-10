# Authesci: Complete Application Review Guide

This document provides a structured walkthrough of the Authesci platform for stakeholders. It details the end-to-end user journeys for every role, outlining the expected visual elements and functionalities at each step.

---

## 🎭 1. The Public Visitor (Acquisition Flow)
*Goal: Trust building and conversion.*

### Step 1: Landing Page (Home)
**Route:** `/`
*   **Visual Expectations:**
    *   **Hero Section:** High-quality imagery of African research context. Headline: "Africa's Premier Research Hub".
    *   **Live Stats Bar:** Counters for Active Researchers, Projects, and Institutions.
    *   **Trust Section:** "How Verification Works" visual guide (Step-by-Step).
    *   **Trending Jobs:** A dynamic feed of the latest ~6 job postings.
*   **Key Action:** Click **"Join as Scientist"** or **"Post a Project"**.

### Step 2: Global Job Board (Teaser)
**Route:** `/jobs`
*   **Visual Expectations:**
    *   A grid/list of active job postings accessible to the public.
    *   Basic filtering (Remote/On-site).
*   **Key Action:** Clicking "Apply" on any job must redirect to **Login/Signup**.

### Step 3: Authentication
**Route:** `/login` or `/signup`
*   **Visual Expectations:**
    *   Clean, branded Auth Card (center screen).
    *   **Role Selection:** Explicit option to sign up as **"Scientist"** or **"Employer"**.
*   **Key Action:** Complete signup -> Redirect to specific Role Dashboard (or Onboarding).

---

## 🧪 2. The Scientist Journey (Talent Flow)
*Goal: Profile building, job discovery, and secure work.*

### Step 1: Dashboard (Landing)
**Route:** `/scientist/dashboard`
*   **Visual Expectations:**
    *   **Financial Cards:** "Total Earned" vs "Potential Earnings" (Escrow).
    *   **Profile Strength:** A circular progress bar (aiming for 100%).
    *   **Recommended Jobs:** A specific section showing jobs matched by AI (based on skills).
    *   **Status:** "Verification Pending" or "Verified" badge.

### Step 2: Profile & AI Optimization
**Route:** `/profile/edit`
*   **Visual Expectations:**
    *   **CV Upload:** Drag-and-drop zone.
    *   **AI Parsing:** (Backend) System auto-extracts skills and experience.
    *   **Bank Details:** "Add Bank Account" form (verified via Paystack).

### Step 3: Application Process
**Route:** `/jobs/[id]/apply`
*   **Visual Expectations:**
    *   **Pre-filled Form:** Name, Email, CV pulled from profile.
    *   **AI Cover Letter:** A "Fill with AI" button that generates a draft based on the Job Description + User CV.
*   **Key Action:** Submit Application -> Redirect to "My Applications".

### Step 4: Collaboration & Chat
**Route:** `/messages` or Project Workspace
*   **Visual Expectations:**
    *   **Chat Interface:** Real-time messaging with the Employer.
    *   **Typing Indicators:** "Employer is typing..."
    *   **Access Control:** Can *only* chat with Employers of satisfied/active jobs or admins.

### Step 5: Active Project (Post-Hire)
**Route:** `/workspace/[projectId]`
*   **Visual Expectations:**
    *   **Kanban Board:** Columns for "To Do", "In Progress", "Done".
    *   **File Sharing:** "Documents" tab for sharing research papers/results.
    *   **Status:** View project status as "Active" (Funded).

---

## 💼 3. The Employer Journey (Client Flow)
*Goal: Hiring talent and managing project funds.*

### Step 1: Employer Dashboard
**Route:** `/employer/dashboard`
*   **Visual Expectations:**
    *   **Stats Cards:** "Active Jobs", "Total Applicants", "Pending Review".
    *   **Quick Actions:** Large button for "Post New Job".

### Step 2: Posting a Job
**Route:** `/employer/jobs/new`
*   **Visual Expectations:**
    *   **Form:** Title, Description, Requirements, Budget Range (Min/Max).
    *   **Publishing:** Currently a free action -> Job goes to `ACTIVE` status immediately.

### Step 3: Candidate Management & AI Ranking
**Route:** `/employer/jobs/[id]/applicants`
*   **Visual Expectations:**
    *   **Ranked List:** Applicants sorted by **AI Match Score** (e.g., "95% Match").
    *   **AI Intel:** A summary explaining *why* a candidate is a good fit (e.g., "Matches required skills: Python, Data Analysis").
    *   **Resume Preview:** View PDF directly in browser (Cloudinary).

### Step 4: Hiring & Escrow (The Money Movement)
**Route:** Hiring Modal -> `/employer/invoices/[id]`
*   **Visual Expectations:**
    *   **Invoice Review:**
        *   **Final Price Input:** Employer confirms exact amount (within budget range).
        *   **Fee Breakdown:** Transparent line item showing **10% Platform Fee**.
        *   **Total:** Scientist Pay + Platform Fee.
    *   **Payment Gateway:** Clicking "Pay & Hire" opens Paystack.
*   **Key Action:** Successful Payment -> Job becomes **Project** -> Funds held in **Escrow**.

### Step 5: Project & Payout
**Route:** `/workspace/[projectId]`
*   **Visual Expectations:**
    *   **Escrow Status:** Distinct card showing "Funds Held in Escrow".
    *   **Release Button:** "Mark Complete & Release Funds" (only visible when work is verified).
*   **Key Action:** Release Funds -> Money moves to Scientist (90%) and Platform (10%).

---

## 🛡️ 4. The Admin Journey (Oversight Flow)
*Goal: System health, revenue tracking, and moderation.*

### Step 1: Admin Dashboard
**Route:** `/admin`
*   **Visual Expectations:**
    *   **Revenue Chart:** Area chart showing Income (Fees) over time.
    *   **User Distribution:** Donut chart (Scientists vs Employers).
    *   **System Health:** Quick status of recent error logs.

### Step 2: User & Content Management
**Route:** `/admin/users` & `/admin/jobs`
*   **Visual Expectations:**
    *   **Data Tables:** Searchable lists of all Users and Jobs.
    *   **Moderation Actions:**
        *   **Ban User:** Prevents login.
        *   **Delete Job:** Removes inappropriate content.

### Step 3: System Logs
**Route:** `/admin/logs`
*   **Visual Expectations:**
    *   **Audit Trail:** A chronologial list of *all* platform actions (Logins, Payments, Edits).
    *   **Filters:** Filter by User ID, Action Type (e.g., "PAYMENT_FAILURE"), or Severity.

### Step 4: Global Support Chat
**Route:** `/messages`
*   **Visual Expectations:**
    *   **Unrestricted Access:** Admin can initiate chat with *any* user for support resolution.
    *   **AI Assistant:** Access to "Admin Bot" for querying system stats via RAG.

---

## ✅ Review Checklist
Use this checklist during the walkthrough to ensure all "Wow" factors are present.

- [ ] **Aesthetics:** Do the landing page and dashboards use the premium "WowDash" gradient styles?
- [ ] **Responsiveness:** Does the Sidebar collapse correctly on mobile?
- [ ] **Feedback:** Do buttons show loading states (spinners) when clicked?
- [ ] **Empty States:** Do dashboards show friendly "Get Started" graphics when no data exists?
- [ ] **Real-time:** Do chat messages appear instantly without refreshing?
- [ ] **Notifications:** Do "Toasts" appear for success/error actions (e.g., "Job Posted Successfully")?
