# Batch 4: Profile Setup & Management Review

## Quick Start
1.  Ensure the application is running locally.
2.  Log in as a user with any role (e.g., Scientist, Employer).
3.  Navigate to `/your-role/profile` to view the profile.
4.  Navigate to `/your-role/profile/edit` to edit the profile.

## Test Accounts/Data
*   **Scientist User:**
    *   Email: `scientist@example.com`
    *   Password: `Password123!`
    *   Expected Role: `SCIENTIST`
*   **Employer User:**
    *   Email: `employer@example.com`
    *   Password: `Password123!`
    *   Expected Role: `EMPLOYER`
*   **Admin User:**
    *   Email: `admin@example.com`
    *   Password: `Password123!`
    *   Expected Role: `ADMIN`

## Step-by-Step Test Cases

### Test Case 1: View Profile (Scientist)
*   **Precondition:** Logged in as `scientist@example.com`.
*   **Steps:**
    1.  Navigate to `/scientist/profile`.
*   **Expected Outcome:**
    *   The unified profile page is displayed.
    *   Fields relevant to a Scientist (e.g., publications, certifications, skills, bio) are visible.
    *   Fields irrelevant to a Scientist (e.g., company-specific fields) are hidden.
    *   The profile data is pre-filled correctly.

### Test Case 2: Edit Profile (Scientist)
*   **Precondition:** Logged in as `scientist@example.com`.
*   **Steps:**
    1.  Navigate to `/scientist/profile/edit`.
    2.  Modify some text fields (e.g., bio, add a skill).
    3.  Attempt to upload a new CV file **via Cloudinary integration**.
    4.  Attempt to upload a new avatar image **via Cloudinary integration**.
    5.  Submit the form.
*   **Expected Outcome:**
    *   The profile editing form is displayed with pre-filled data.
    *   Scientist-specific fields are editable.
    *   CV and avatar upload components are functional **and integrate with Cloudinary**.
    *   Upon submission, the profile is updated in the database.
    *   User is redirected to `/scientist/profile` with a success message.
    *   The updated information (including new CV/avatar **Cloudinary URLs**) is displayed on the profile page.

### Test Case 3: View Profile (Employer)
*   **Precondition:** Logged in as `employer@example.com`.
*   **Steps:**
    1.  Navigate to `/employer/profile`.
*   **Expected Outcome:**
    *   The unified profile page is displayed.
    *   Fields relevant to an Employer (e.g., institution/company name, contact info) are visible.
    *   Fields irrelevant to an Employer (e.g., publications, research area) are hidden.
    *   The profile data is pre-filled correctly.

### Test Case 4: Edit Profile (Employer)
*   **Precondition:** Logged in as `employer@example.com`.
*   **Steps:**
    1.  Navigate to `/employer/profile/edit`.
    2.  Modify some text fields (e.g., institution).
    3.  Attempt to upload a new avatar image **via Cloudinary integration**.
    4.  Submit the form.
*   **Expected Outcome:**
    *   The profile editing form is displayed with pre-filled data.
    *   Employer-specific fields are editable.
    *   Avatar upload component is functional **and integrates with Cloudinary**.
    *   Upon submission, the profile is updated in the database.
    *   User is redirected to `/employer/profile` with a success message.
    *   The updated information (including new avatar **Cloudinary URL**) is displayed on the profile page.

### Test Case 5: Profile Completion Redirect
*   **Precondition:** Logged in as a new user with `completionScore` < threshold (e.g., 0).
*   **Steps:**
    1.  Attempt to navigate to `/your-role/dashboard`.
*   **Expected Outcome:**
    *   User is redirected to `/your-role/profile/edit` to complete their profile.

## Edge Cases
*   **Invalid File Upload:** Attempt to upload a file type not allowed (e.g., `.exe`) or a file exceeding size limits **to Cloudinary**. Expected: Error message, file not uploaded.
*   **Empty Required Fields:** Attempt to submit the edit form with required fields empty. Expected: Validation errors displayed, form not submitted.
*   **Unauthorized Access:** Attempt to access `/employer/profile` as a Scientist (and vice-versa). Expected: Redirection to own role's profile page or dashboard.
*   **Profile Not Found:** (Rare, but possible) If a user is authenticated but their Prisma profile is missing. Expected: Graceful error handling, potentially redirection to a profile creation flow or error page.

## Accessibility Checks
*   All form fields have associated `<label>` elements.
*   Form inputs are keyboard navigable and usable.
*   Error messages are clearly associated with their respective input fields.
*   Color contrast meets WCAG 2.1 AA standards.
*   Image uploads have appropriate alt text.