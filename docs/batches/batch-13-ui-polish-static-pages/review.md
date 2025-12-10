# Review Guide - Batch 13: UI Polish & Static Pages

## Quick Start
1.  **Navigate to In-Lab:** Log in and go to `/in-lab`.
2.  **Test Error Pages:** Visit a random URL like `/dashboard/xyz789` to see the 404 page.
3.  **Test Mobile:** Open DevTools, toggle Device Toolbar (Ctrl+Shift+M), select "iPhone 12", and check the sidebar.

## Test Data Setup
*   **User:** Ensure you are logged in (any role).
*   **Database:** Access to `Subscription` table (via Prisma Studio or Supabase).

## Step-by-Step Test Cases

### 1. In-Lab "Notify Me"
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Navigate to `/in-lab` | Page loads with "Coming Soon" styling. |
| 2 | Enter a valid email (e.g., `test@example.com`) and click Notify | Success toast appears. |
| 3 | Check Database (`Subscription` table) | New record exists with `email: "test@example.com"` and `source: "IN_LAB_WAITLIST"`. |
| 4 | Try same email again | Success toast (idempotent) or friendly "Already subscribed" message. |

### 2. Loading Skeletons
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Navigate to `/jobs` (or a data-heavy page) | Skeleton lines/cards appear immediately. |
| 2 | Enable "Slow 3G" in Network tab and refresh | Skeleton persists until data loads, then swaps instantly without layout shift. |

### 3. Error Pages
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Visit `/non-existent-swamp` | Custom 404 page displayed with "Return Home" button. |
| 2 | Click "Return Home" | Navigates back to dashboard or landing page. |

### 4. Mobile Responsiveness
| Step | Action | Expected Outcome |
| :--- | :--- | :--- |
| 1 | Resize browser to < 768px | Desktop sidebar disappears. Hamburger menu appears. |
| 2 | Click Hamburger menu | Sidebar slides in (Sheet). |
| 3 | Click a menu item | Sidebar closes, navigates to page. |
| 4 | Open a table view (e.g., Job Applications) | Table is horizontally scrollable. Rows do not break or squish. |

## Accessibility Checks
- [ ] **Forms:** "Notify Me" input has `aria-label` or associated label.
- [ ] **Navigation:** Mobile menu trigger is accessible via keyboard/screen reader.
- [ ] **Contrast:** Ensure "In-Lab" page text meets AA standards.
- [ ] **Skeletons:** Should have `aria-hidden="true"` or appropriate loading role.

## Edge Cases
-   **Network Failure:** If "Notify Me" fails due to network, show error toast.
-   **Javascript Disabled:** Skeletons might not animate, but content should eventually load (Server Components).
-   **Very Large Tables:** Ensure horizontal scrollbar is visible and usable on desktop when window is narrow.
