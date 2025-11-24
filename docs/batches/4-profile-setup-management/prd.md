# Batch 4: Profile Setup & Management PRD

## Title: Profile Setup & Management

## Short Description

This batch focuses on enabling users to create, view, and manage their personal and professional profiles within the Authesci platform. It includes extending the Prisma `Profile` model, implementing server actions for profile updates and **Cloudinary file uploads**, developing a single unified profile page with inline edit mode toggle, and adding a profile completion helper function that powers a dashboard card, role-based field visibility, and a verified badge (shown at 80%+ completion).

## Goals & Metrics

- **Goal:** Provide a comprehensive and role-aware profile management system.
- **Metric:** 100% of users can successfully create and update their profile information.
- **Metric:** All profile fields are correctly displayed and editable based on user role.
- **Metric:** File uploads (CVs, avatars) are functional and securely stored **via Cloudinary**.

## Acceptance Criteria (GIVEN/WHEN/THEN)

### Scenario: User views their own profile

- **GIVEN** a user is authenticated and has a profile.
- **WHEN** the user navigates to `/their-role/profile`.
- **THEN** they should see a unified profile page displaying their information.
- **AND** fields specific to their role should be visible, while irrelevant fields are hidden.

### Scenario: User edits their own profile (inline)

- **GIVEN** a user is authenticated and viewing their profile page.
- **WHEN** the user clicks the "Edit" button in the card header.
- **THEN** the component switches to edit mode, displaying the editable form inline.
- **AND** they should be able to modify fields relevant to their role.
- **AND** they should be able to upload/update their CV and avatar **to Cloudinary**.
- **WHEN** the user submits the form with valid data.
- **THEN** their profile information should be updated in the database.
- **AND** the component switches back to view mode with a success message.
- **WHEN** the user clicks "Cancel".
- **THEN** the component switches back to view mode without saving changes.

### Scenario: User uploads a file (CV/Avatar)

- **GIVEN** a user is in edit mode on their profile page.
- **WHEN** the user attempts to upload a CV or avatar file.
- **THEN** the file should be securely uploaded to **Cloudinary**.
- **AND** the corresponding `cvUrl` or `avatarUrl` field in their `Profile` should be updated with the **Cloudinary URL**.

### Scenario: Dashboard shows profile completion card

- **GIVEN** a user is on their role dashboard.
- **WHEN** their profile completion percentage is below 100%.
- **THEN** a profile completion card should be displayed showing the current completion percentage.
- **AND** the card should suggest next steps ("Complete your skills", "Upload your CV", etc.).
- **AND** clicking the card should navigate to `/profile` to allow inline editing.
- **AND** the card should disappear when profile completion reaches 100%.

### Scenario: Profile completion affects feature access

- **GIVEN** a user's profile completion is below 80%.
- **WHEN** they attempt to access certain features (e.g., apply for jobs, post projects).
- **THEN** those features should be hidden or disabled with a prompt to complete their profile.
- **AND** a verified badge should NOT appear on their profile.
- **WHEN** their profile completion reaches 80%+ and they reload the page.
- **THEN** the verified badge should appear on their profile image.
- **AND** restricted features should become available.

## UX/Template References

- **View Profile:** `authesci-app/templates/wowdash/src/html/pages/view-profile.html`
- **Edit Profile Form Layout:** `authesci-app/templates/wowdash/src/html/pages/form-layout.html`, `form.html`
- **Image Upload Component:** `authesci-app/templates/wowdash/src/html/pages/image-upload.html` (for avatar/CV upload UI inspiration)
- **Cloudinary Integration:** Consider using Cloudinary's upload widget or direct API integration for `FileUploader.tsx`.

## Data Model Changes (Prisma Snippet)

The `Profile` model will be extended as follows:

```prisma
model Profile {
  id              String   @id @default(uuid())
  userId          String   @unique
  email           String   @unique
  fullName        String
  role            Role     @default(SCIENTIST)
  bio             String?
  skills          String[] @default([])
  experience      String?
  cvUrl           String?  @map("cv_url")
  avatarUrl       String?  @map("avatar_url")
  institution     String?
  publications    String[] @default([]) // New field
  certifications  String[] @default([]) // New field
  completionScore Int      @default(0) // New field
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // ... existing relationships
}
```

## Components List (Server/Client)

### Server Components

- `app/(role)/profile/page.tsx` (Role-specific): Entry point that fetches user profile and passes to `ProfilePage`.
- `app/profile/PageContent.tsx` (Unified Server): Fetches user profile data and renders the unified profile layout.

### Client Components

- `app/profile/ProfilePage.tsx` (Client Component): Manages view/edit mode toggle. Renders either `ProfileView` or `ProfileEditForm`.
- `app/profile/ProfileView.tsx` (Client Component): Displays read-only profile with Edit button in card header, conditional fields based on role, and verified badge (shown if completion >= 80%).
- `app/profile/ProfileEditForm.tsx` (Client Component): Interactive form for editing profile, with conditional fields per role, save/cancel buttons.
- `components/modules/profiles/SkillsInput.tsx` (Client Component): Tag-style input for managing skills.
- `components/modules/profiles/FileUploader.tsx` (Client Component): Drag-and-drop file upload for CV and avatar, integrates with Cloudinary.
- `components/modules/profiles/ProfileCompletionCard.tsx` (Client Component): Dashboard card showing completion percentage, suggestions, and link to profile page. Hidden when completion >= 100%.
- `components/modules/profiles/VerifiedBadge.tsx` (Client Component): Badge overlay on profile image, displayed when completion >= 80%.

### Helper Functions

- `lib/helpers/getProfileCompletion.ts`: Function that calculates profile completion percentage based on filled fields. Used in ProfilePage, dashboard, and any feature that needs to check completion status.

## Basic Implementation Plan

1.  **Update Prisma Schema:** Add `publications`, `certifications`, and `completionScore` fields to the `Profile` model. Run `npx prisma migrate dev`.
2.  **Cloudinary Setup:**
    - Create a Cloudinary account and configure an upload preset for secure file uploads.
    - Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to `.env.local`.
3.  **Create Profile Completion Helper:**
    - Create `lib/helpers/getProfileCompletion.ts` that calculates completion % based on required fields per role.
    - Return object: `{ percentage: number; missingFields: string[]; isVerified: boolean }`.
4.  **Create Unified Profile Page (Single URL):**
    - Create `app/(role)/profile/page.tsx` (Server Component) that fetches user profile.
    - Create `app/profile/PageContent.tsx` (Server Component) that renders the page layout.
5.  **Develop Client Components with View/Edit Toggle:**
    - `ProfilePage.tsx` (Client): Manages `isEditMode` state. Renders either `ProfileView` or `ProfileEditForm`.
    - `ProfileView.tsx` (Client): Display-only profile with Edit button in card header, role-based field visibility, verified badge if >= 80%.
    - `ProfileEditForm.tsx` (Client): Inline form with role-based fields, save/cancel buttons.
    - `SkillsInput.tsx` (Client): Tag-style skill input.
    - `FileUploader.tsx` (Client): Drag-and-drop upload for CV/avatar.
    - `ProfileCompletionCard.tsx` (Client): Dashboard card (hidden at 100%). Shows % and action items.
    - `VerifiedBadge.tsx` (Client): Badge overlay on profile image (shown at >= 80%).
6.  **Implement Server Actions (`app/actions/profile.ts`):**
    - `updateProfile`: Handles updating text-based profile fields and recalculates completion %.
    - `uploadFile`: Handles file uploads **to Cloudinary** and updates `cvUrl`/`avatarUrl`.
7.  **Integrate Dashboard Card:**
    - In the role dashboard (e.g., `app/scientist/dashboard/page.tsx`), import and render `ProfileCompletionCard`.
    - Pass the user profile; the card auto-hides when completion >= 100%.
8.  **Integrate Feature Gates:**
    - Create a `useProfileCompletion` hook or export from server action to check profile completion.
    - In job application, project posting, and other features, conditionally hide or disable UI if completion < 80%.
9.  **Update `getAuthenticatedUser`:** Ensure it fetches extended profile fields.

## Risks and Dependencies

- **Risk:** Complex form validation and error handling for multiple field types and roles.
- **Risk:** Secure and efficient **Cloudinary file upload** integration.
- **Risk:** Accurate and consistent profile completion calculation across all conditional UI (verified badge, feature gates, dashboard card).
- **Dependency:** Completion of Batch 3 (Dashboard Layouts & Navigation) for consistent UI and dashboard integration.
- **Dependency:** Robust Server Action error handling and client-side display.
- **Dependency:** Proper configuration of **Cloudinary account, upload presets, and API credentials**.

## MCP Tools & Resources

When implementing this batch, use the following tools to fetch current documentation and best practices:

- **context7**: Fetch Cloudinary SDK docs for Node.js file upload and URL handling.
- **context7**: Fetch React hooks and state management patterns for the view/edit toggle logic.
- **task-master-ai**: Query prior tasks related to profile features to understand blockers and design decisions.
- **supabase** (if applicable): Check if any profile schema changes depend on Supabase storage integration.
