# Batch 8: Notifications & AI System

## 1. Overview
**Goal:** Implement an intelligent notification system and AI-powered features to enhance the job application process for both Scientists and Employers. This batch introduces AI-driven job recommendations, automated cover letter generation, and applicant ranking, alongside a robust notification system (in-app and email).

**Context:** This batch focuses on increasing engagement and efficiency. Scientists get personalized job matches and tools to apply faster, while Employers get ranked candidates to screen applications more effectively.

## 2. Goals & Metrics
- **Efficiency:** Reduce time-to-apply for Scientists by 30% via AI cover letters.
- **Engagement:** Increase application rate by 20% through targeted job recommendations.
- **Screening:** Reduce Employer screening time by providing AI-ranked applicant lists.
- **Retention:** Improve user retention with timely notifications (email & in-app).

## 3. User Stories & Acceptance Criteria

### 3.1 AI Job Recommendations (Hybrid)
- **GIVEN** a Scientist with a completed profile (skills, experience),
- **WHEN** they visit the main "Jobs" page,
- **THEN** they should see recommended jobs mixed into the list, highlighted with a distinct "AI Recommended" tag (gradient/animated).
- **AND** clicking the tag or a "Why?" icon opens a tooltip/modal with the "Match Score" and reasoning.
- **AND** keywords and job types should be strictly science-focused (e.g., "Lab Technician", "Bioinformatics").

### 3.2 AI Cover Letter Generation
- **GIVEN** a Scientist applying for a job,
- **WHEN** they click "Fill with AI" on the cover letter step,
- **THEN** the system should generate a personalized cover letter based on their profile and the job description.
- **AND** this feature should be gated by a master AI toggle and Premium status.

### 3.3 Employer Applicant Ranking
- **GIVEN** an Employer viewing applicants for a job,
- **WHEN** they access the "Applicants" tab,
- **THEN** they should see candidates sorted by "AI Match Score".
- **AND** clicking a "Match Info" icon reveals the detailed score and highlights.

### 3.4 AI Configuration & System Prompts
- **Global Toggle:** An environment variable `NEXT_PUBLIC_ENABLE_AI_FEATURES` (true/false) to switch all AI features on/off.
- **Premium Logic:** If AI is enabled, check `user.isPremium`. If false, show "Upgrade to Premium" upsell on AI features.
- **System Prompts:** All AI system prompts (for cover letters, ranking, etc.) must be stored in a dedicated file (e.g., `lib/ai/prompts.ts` or a database table) for easy updates.

### 3.4 Notifications (In-App & Email)
- **GIVEN** a Scientist submits an application,
- **THEN** they should receive an immediate email confirmation.
- **AND** the Employer should receive an email notification of a new applicant.
- **WHEN** the Employer updates the application status (e.g., "Interview"),
- **THEN** the Scientist should receive an in-app notification and an email update.
- **WHEN** the system finds new high-match jobs,
- **THEN** the Scientist should receive a "Job Recommendation" email (digest or instant).

## 4. UX & Design
- **Notifications:**
  - Bell icon in Navbar with unread badge.
  - Dropdown list for recent notifications.
  - "Mark as read" functionality.
  - **Reference Templates:** Use a clean list template (e.g., `list.html` or `dropdown.html` adapted) instead of `notification.html`.
- **AI Badges:**
  - Use a distinct icon/color (e.g., purple/sparkles) to denote AI-generated content.
  - Tooltips to explain "Match Score".
  - **Reference Templates:** `badges.html`, `tooltip.html`
- **Email Templates:**
  - Use templates from `authesci-app/templates/Email` as the base.
  - **Action:** Copy assets to public folder and ensure links are absolute for email clients.
  - **Reference Templates:** `email_index.html`, `email_transactional.html`
- **Lists & Cards:**
  - Job and Applicant lists.
  - **Reference Templates:** `card.html`, `list.html`, `users-list.html`

## 5. Data Model Changes
**Prisma Schema Updates:**

```prisma
model Profile {
  // ... existing fields
  cvUrls          String[]
  cvIntel         Json?
  aiFeatureVector Unsupported("vector")? // Requires pgvector extension
  isPremium       Boolean   @default(false)
  // notifications relation already exists
}

model Job {
  // ... existing fields
  aiFeatureVector         Unsupported("vector")?
  aiIntel                 Json?
  aiRecommendedScientists Json?
}

model Application {
  // ... existing fields
  aiMatchScore Float?
  aiIntel      Json?
}

model Notification {
  // ... existing fields (id, userId, type, message, read, metadata, createdAt)
  
  // NEW FIELDS TO ADD:
  title     String?  // Add this
  link      String?  // Add this
}
```

## 6. Implementation Plan

### 6.1 Backend & Database
- [ ] Enable `pgvector` extension in Supabase.
- [ ] Update Prisma schema and run migrations.
- [ ] Implement `Notification` service (create, mark read, list).
- [ ] Set up Nodemailer with Hostinger SMTP in `lib/mail.ts`.

### 6.2 AI Pipeline (Gemini)
- [ ] Create `lib/ai/prompts.ts` to centralize all system prompts.
- [ ] Implement `extract_cv_text` (Cloudinary -> Text).
- [ ] Implement `generate_embeddings` (Text -> Vector).
- [ ] Implement `generate_cover_letter` (Profile + Job -> Text).
- [ ] Implement `rank_applicants` (Vector Similarity + LLM Rerank).
- [ ] Implement `AI_ENABLED` and `isPremium` checks.

### 6.3 Frontend Features
- [ ] **Navbar:** Add Notification Bell component (using list style).
- [ ] **Job List:** Add "Recommended" tag logic and tooltip/modal for match score.
- [ ] **Application Flow:** Add "Fill with AI" button to Cover Letter form.
- [ ] **Employer Dashboard:** Update Applicant List to support sorting by Match Score.

### 6.4 Email System
- [ ] Create email templates (`emails/application-received.tsx`, `emails/new-applicant.tsx`, `emails/status-update.tsx`).
- [ ] Integrate email sending into Server Actions (`applyForJob`, `updateApplicationStatus`).

## 7. MCP Tools & Resources
**Option B: Tools for Implementation**

- **Database & Vector Search:**
  - Use `supabase` MCP to check if `pgvector` is enabled and to debug vector queries.
  - Use `supabase` MCP to inspect `aiFeatureVector` data during testing.

- **AI & Documentation:**
  - Use `context7` to fetch latest Gemini API docs if needed for embedding generation.
  - Use `context7` to get `pgvector` usage examples with Prisma.

- **Testing:**
  - Use `playwright` to test the full application flow (Apply -> Notification -> Email trigger).

## 8. Risks & Dependencies
- **Dependencies:** Batch 7 (Payments) - Premium features rely on payment status (though can be mocked with `isPremium` flag).
- **Risks:**
  - **Latency:** AI generation might be slow. Implement loading states and optimistic UI.
  - **Cost:** Vector storage and LLM calls. Monitor usage.
  - **Email Deliverability:** Ensure SMTP is correctly configured to avoid spam folders.
