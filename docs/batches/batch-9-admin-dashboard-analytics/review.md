# Batch 9 Review & Testing Guide

## 1. Quick Start
*   **Prerequisites:** Ensure Batch 8 is completed and database is migrated.
*   **Test Accounts:**
    *   **Admin:** `admin@authesci.com` (Role: ADMIN)
    *   **Employer:** `employer@test.com` (Role: EMPLOYER) - Should have posted jobs.
    *   **Scientist:** `scientist@test.com` (Role: SCIENTIST) - Should have applied to jobs.

## 2. Step-by-Step Test Cases

### 2.1 Employer Analytics
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Login as **Employer**. | Redirected to `/employer/dashboard`. |
| 2 | View the top of the dashboard. | **Stats Cards** are visible (Active Jobs, Applicants, etc.). |
| 3 | Verify the visual style. | Cards match the `index-10.html` gradient style. |
| 4 | Check the numbers. | Numbers match the actual count of jobs/applications in the DB. |

### 2.2 Admin User Management
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Login as **Admin**. | Redirected to `/admin/dashboard` (or accessible via menu). |
| 2 | Navigate to `/admin/users`. | Table of all users is displayed. |
| 3 | Find a test user and click **Ban**. | User status updates to "BANNED". Toast notification appears. |
| 4 | Try to login as the Banned User. | Login should fail or redirect to a "Account Suspended" page. |

### 2.3 Admin Job Management
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Login as **Admin**. | - |
| 2 | Navigate to `/admin/jobs`. | Table of all jobs is displayed. |
| 3 | Find a test job and click **Delete**. | Job is removed from the list. |
| 4 | Verify as Employer. | The deleted job is no longer visible in the Employer's job list. |

### 2.4 System Logs & Audit
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Perform an action (e.g., Log out and Log in). | - |
| 2 | Login as **Admin** and go to `/admin/logs`. | The Login action appears in the global log list. |
| 3 | Login as **Scientist** and go to `/scientist/activity`. | The Login action appears in my personal log list. |
| 4 | Trigger a failure (e.g., try to access a protected route). | A "FAILURE" or "WARN" log entry is created. |

### 2.5 Admin Charts
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Login as **Admin**. | - |
| 2 | View Dashboard Charts. | **Revenue Chart** displays data points. **User Donut** shows correct split of roles. |
| 3 | Hover over charts. | Tooltips display correct values. |

### 2.6 Scientist Dashboard
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Login as **Scientist**. | - |
| 2 | View Dashboard. | **Profile Completion** bar shows percentage (e.g., 80%). |
| 3 | Check Stats Cards. | "Applications Sent" count matches actual applications. |

## 3. Edge Cases
*   **No Data:** Ensure Stats Cards show "0" instead of breaking when an employer has no jobs.
*   **Pagination:** If there are 100+ users, ensure the Admin User Table handles pagination or infinite scroll (or at least limits the initial fetch).
*   **Self-Ban:** Prevent an Admin from banning themselves.

## 4. Accessibility Checks
*   **Contrast:** Ensure white text on gradient backgrounds has sufficient contrast (WCAG AA).
*   **Tables:** Ensure tables have proper `<th>` headers and are responsive (scrollable on mobile).
*   **Focus:** Ensure Action Menus (Ban/Delete) are keyboard navigable.
