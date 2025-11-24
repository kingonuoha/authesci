# Batch 7 Review & Testing Guide (Revised)

## 1. Quick Start
- Ensure `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` are set.
- Use Paystack Test Bank Accounts for verification testing.

## 2. Test Accounts
- **Employer:** `employer@test.com`
- **Scientist:** `scientist@test.com`

## 3. Step-by-Step Test Cases

### Case 1: Job Posting (Free)
1.  **Login** as Employer.
2.  **Post** a Job.
3.  **Verify** it goes `ACTIVE` immediately without asking for payment.

### Case 2: Hiring & Invoice Flow
1.  **Employer** views applicants for the Job.
2.  **Click** "Hire".
3.  **Verify** redirection to `/employer/invoices/[id]`.
4.  **Check** Invoice details (Job Title, Budget).
5.  **Input** a Coupon Code (e.g., "TEST").
    - **Expect:** Error message "Coupon invalid: Feature not yet implemented."
6.  **If Job has Range:**
    - Try entering a price outside the range. **Expect:** Validation error.
    - Enter a valid price.
    - Hover over the tooltip. **Expect:** Explanation text.
7.  **Click** "Pay Now".
8.  **Complete** Paystack payment.
9.  **Verify** Job converts to Project and status is `ACTIVE`.

### Case 3: Scientist Bank Details
1.  **Login** as Scientist (who has an active job).
2.  **Verify** a Dashboard Card appears: "Add Bank Details".
3.  **Navigate** to Wallet/Settings.
4.  **Enter** Bank Name and Account Number.
5.  **Verify** the Account Name resolves automatically (simulated or real test API).
6.  **Save**.

### Case 4: Payout Calculation
1.  **Admin** checks the database for the `Payment` record created in Case 2.
2.  **Verify** `platformFee` is 10% of the total.
3.  **Verify** `scientistAmount` is 90% of the total.

## 4. Edge Cases
-   **Range Adjustment:** What if the employer tries to pay *less* than the minimum? (Should be blocked).
-   **Bank Verification Fail:** Handle invalid account numbers gracefully.

## 5. Accessibility Checks
-   **Tooltips:** Ensure they are accessible via keyboard focus.
-   **Invoice:** Ensure the table structure is semantic for screen readers.
