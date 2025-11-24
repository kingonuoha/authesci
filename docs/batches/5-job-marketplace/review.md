# Review Guide: Batch 5 - Job Marketplace

## 1. Quick Start
1.  Ensure you are running the latest version of the app: `npm run dev`.
2.  Ensure database migrations are applied: `npx prisma migrate dev`.
3.  Open `http://localhost:3000`.

## 2. Test Accounts & Data
You will need two browser sessions (or one Incognito) to test the interaction between roles.

| Role | Email | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Employer** | `employer@test.com` | `password123` | Use to post jobs and review applicants. |
| **Scientist** | `scientist@test.com` | `password123` | Use to browse and apply for jobs. |

*Note: If these accounts don't exist, sign up for them manually.*

## 3. Step-by-Step Test Cases

### Test Case A: Employer Posts a Job
1.  **Login** as Employer.
2.  Navigate to **Dashboard > Post New Job**.
3.  Fill in:
    -   Title: "Senior Researcher"
    -   Description: "Looking for an expert in molecular biology."
    -   Type: "Remote"
    -   Location: "New York, NY"
4.  Click **Submit**.
5.  **Expected:** Redirected to Job List. New job appears with status `DRAFT` (or `ACTIVE`).

### Test Case B: Scientist Browses & Applies
1.  **Login** as Scientist (in a different browser/window).
2.  Navigate to **Job Marketplace**.
3.  **Expected:** You see the "Senior Researcher" job listed.
4.  Click on the job card.
5.  **Expected:** View Job Details page.
6.  Click **Apply Now**.
7.  Fill in Cover Letter: "I am very interested..."
8.  Click **Submit Application**.
9.  **Expected:** Success message. Button changes to "Applied".

### Test Case C: Employer Reviews Application
1.  Switch back to **Employer** session.
2.  Navigate to **Dashboard > Manage Jobs**.
3.  Click on "Senior Researcher" job (or "View Applicants").
4.  **Expected:** You see the Scientist's name in the list.
5.  Click on the applicant.
6.  **Expected:** View their profile and cover letter.
7.  Click **Shortlist**.
8.  **Expected:** Status updates to `SHORTLISTED`.

## 4. Edge Cases
-   **Duplicate Application:** Try applying for the same job again as the Scientist. Should be prevented (button disabled or error message).
-   **Incomplete Profile:** Try applying as a Scientist with an empty profile. Should prompt to complete profile first.
-   **Deleted Job:** If Employer deletes the job, it should disappear from the Marketplace and Scientist's application list (or show as "Job Closed").

## 5. Accessibility Checks
-   [ ] **Keyboard Navigation:** Can you tab through the Job Board and Application Form?
-   [ ] **Screen Reader:** Do form inputs have associated labels?
-   [ ] **Contrast:** Are job status badges (e.g., "Remote", "Applied") readable?
