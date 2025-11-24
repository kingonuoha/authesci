# Batch 7: Payment & Escrow (Revised)

## 1. Short Description
Implement the platform's monetization and secure payment flow. This batch shifts the payment trigger from "Job Posting" to "Hiring," introduces an Invoice review step with price adjustments, and establishes a trust-centric Escrow system with transparent fee breakdowns.

## 2. Goals & Metrics
- **Goal:** Enable revenue generation via a 10% platform fee on project budgets.
- **Goal:** Build trust through transparent invoicing and escrow management.
- **Goal:** Ensure Scientists get paid securely by verifying bank details.
- **Metric:** Conversion rate from "Job Posted" to "Project Funded".
- **Metric:** Successful payouts to verified bank accounts.

## 3. Acceptance Criteria

### Job Posting (Free)
- **GIVEN** an Employer creates a Job
- **WHEN** they click "Publish"
- **THEN** the Job status becomes `ACTIVE` immediately without payment.

### Hiring & Invoicing
- **GIVEN** an Employer selects an applicant to hire
- **WHEN** they click "Hire & Fund"
- **THEN** they are redirected to an **Invoice Page**.
- **AND** the Invoice shows the Job Budget.
- **AND** if the Job had a **Salary Range**, the Employer can input the **Final Price**.
    - *Constraint:* Input must be within the min/max of the range.
    - *UI:* Tooltip explains "You used a range price; please confirm the final agreed amount."
- **AND** there is a **Coupon Code** input.
    - *Constraint:* Entering any code shows a static error: "Coupon invalid: Feature not yet implemented."

### Payment & Escrow
- **GIVEN** the Employer is on the Invoice Page
- **WHEN** they click "Pay Now"
- **THEN** they are redirected to Paystack.
- **AND** upon success:
    - A `Payment` record is created (`FUNDED`).
    - The Job becomes a `Project` (`ACTIVE`).
    - The funds are held in Escrow.
    

### Payout & Fees
- **GIVEN** a Project is completed and funds are released
- **THEN** the total amount is split:
    - **90%** to the Scientist.
    - **10%** to the Platform.
- **AND** the Scientist receives their share to their verified bank account.

### Bank Details (Scientist)
- **GIVEN** a Scientist has an `ACTIVE` job/project
- **WHEN** they view their dashboard
- **THEN** a card prompts them to "Add Bank Details" if missing.
- **AND** the form verifies account info via Paystack API.

## 4. UX/Template References
- **Invoice Page:** Adapt `authesci-app/templates/wowdash/src/html/pages/invoice-preview.html`.
    - Use the table layout for line items (Job Title, Agreed Price).
    - Add the Coupon input field near the total.
- **Payment Modal:** Adapt `authesci-app/templates/wowdash/src/html/pages/payment-gateway.html` styles for the checkout redirection state.
- **Bank Details Form:** Use `authesci-app/templates/wowdash/src/html/pages/wallet.html` or `form-layout.html` for the input fields.
- **Tooltips:** Use `authesci-app/templates/wowdash/src/html/pages/tooltip.html` for the price range explanation.

## 5. Data Model Changes

**Profile Model Update:**
```prisma
model Profile {
  // ... existing fields
  bankName      String?
  accountNumber String?
  accountName   String?
  recipientCode String? // Paystack Transfer Recipient Code
}
```

**Job Model Update:**
```prisma
model Job {
  // ... existing fields
  finalPrice    Decimal? @db.Decimal(10, 2) // Set at hiring time
}
```

**Payment Model Update:**
```prisma
model Payment {
  // ... existing fields
  platformFee   Decimal @db.Decimal(10, 2) // 10%
  scientistAmount Decimal @db.Decimal(10, 2) // 90%
}
```

## 6. Components

### Pages (Server Components)
- `app/employer/invoices/[id]/page.tsx`: The Invoice Review page.
- `app/scientist/wallet/page.tsx`: Page for managing bank details.

### Client Components
- `components/modules/payment/InvoiceActions.tsx`: Handles "Final Price" input, Coupon logic, and "Pay" button.
- `components/modules/payment/BankDetailsForm.tsx`: Form with Paystack account resolution.
- `components/modules/payment/EscrowCard.tsx`: Shows "Funds Held" with a transparent breakdown (Total = Scientist Pay + Fee).

## 7. Implementation Plan

1.  **Database Updates:**
    -   Add bank fields to `Profile`.
    -   Add `finalPrice` to `Job`.
    -   Add fee split fields to `Payment`.
2.  **Bank Verification:**
    -   Implement `resolveAccount` server action using Paystack API.
    -   Build `BankDetailsForm` for Scientists.
3.  **Hiring Flow:**
    -   Create `Invoice Page` based on `invoice-preview.html`.
    -   Implement "Final Price" validation logic.
    -   Implement Coupon stub.
4.  **Payment Integration:**
    -   Update `fundProject` action to accept `finalPrice`.
    -   Calculate 90/10 split and store in `Payment` record.
    -   Redirect to Paystack.
5.  **Trust UI:**
    -   Add tooltips explaining the 10% fee and Escrow security.
    -   Show "Verified" badge on bank accounts.

## 8. MCP Tools & Resources
-   **`context7`**: Paystack API (Transfers & Verification).
-   **`supabase`**: Check schema updates.
-   **`task-master-ai`**: Track tasks.

## 9. Risks & Dependencies
-   **Risk:** Users might be confused by the "Final Price" if they forgot the original range.
    -   *Mitigation:* Display the original range clearly next to the input.
-   **Risk:** Paystack verification downtime.
    -   *Mitigation:* Allow saving details manually with a "Unverified" warning.
