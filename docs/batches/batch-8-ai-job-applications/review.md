# Batch 8 Review & Testing Guide

## 1. Quick Start
- **Prerequisites:**
  - `pgvector` enabled in Supabase.
  - `GOOGLE_GENERATIVE_AI_KEY` set in `.env`.
  - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` set in `.env`.

- **Test Accounts:**
  - **Scientist:** `scientist@test.com` (Premium & Free)
  - **Employer:** `employer@test.com`

## 2. Step-by-Step Test Cases

### 2.1 AI Job Recommendations
- [ ] **Login as Scientist.**
- [ ] **Navigate to Dashboard.**
- [ ] **Verify "Recommended Jobs" section.**
  - [ ] Jobs should be sorted by relevance.
  - [ ] Check "Match Score" and "Why this matches" tooltip.
- [ ] **Action:** Update profile skills.
- [ ] **Verify:** Recommendations should refresh (might need manual trigger or wait for cache invalidation).

### 2.2 AI Cover Letter
- [ ] **Navigate to a Job Posting.**
- [ ] **Click "Apply".**
- [ ] **Step 2 (Cover Letter):** Click "Fill with AI".
- [ ] **Verify:** Text area populates with a coherent letter referencing user skills and job reqs.
- [ ] **Edge Case:** User with no skills/experience -> Should show error or generic fallback.

### 2.3 Employer Applicant Ranking
- [ ] **Login as Employer.**
- [ ] **Navigate to "My Jobs" -> "View Applicants".**
- [ ] **Verify Sorting:** Applicants should be ordered by Match Score.
- [ ] **Verify Highlights:** "Strong match" tags should be visible.

### 2.4 Notifications
- [ ] **Trigger:** Apply for a job as Scientist.
- [ ] **Verify Email:** Scientist receives confirmation email.
- [ ] **Verify Email:** Employer receives "New Applicant" email.
- [ ] **Trigger:** Employer changes status to "Interview".
- [ ] **Verify In-App:** Scientist sees bell notification.
- [ ] **Verify Email:** Scientist receives status update email.

## 3. Accessibility Checks
- [ ] **Notifications:** Bell icon must be keyboard accessible (Enter/Space to open).
- [ ] **Badges:** AI badges must have `aria-label` or screen reader text.
- [ ] **Emails:** Must be readable with high contrast and proper heading structure.

## 4. Expected Outcomes
- **Database:** `Notification` table populated. `aiMatchScore` fields populated.
- **UX:** Smooth transitions, no blocking UI during AI generation (use loading skeletons).
- **Email:** Delivered to inbox (check spam folder during testing).
