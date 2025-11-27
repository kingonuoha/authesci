# Review Guide: Batch 10 - Robust Chat & AI Assistant

## 1. Quick Start
To quickly test the chat features:
1.  **Database:** Ensure you have run `npx prisma migrate dev` to apply the new chat schema.
2.  **Env Vars:** Verify `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GOOGLE_API_KEY` are set in `.env`.
3.  **Navigate:** Log in as a user and go to `/chat` (or the specific dashboard chat route).

## 2. Test Accounts & Data
Use the following account types to verify RBAC:
-   **Employer:** `employer@test.com` (Has active Job `JOB_123`)
-   **Scientist:** `scientist@test.com` (Applied to `JOB_123`)
-   **Admin:** `admin@test.com`
-   **Random User:** `random@test.com` (No connections)

## 3. Test Scenarios

### 3.1 Real-Time Messaging (Happy Path)
-   **Step 1:** Open two different browsers/incognito windows.
-   **Step 2:** Log in as `Employer` in one and `Scientist` in the other.
-   **Step 3:** `Employer` starts a new chat with `Scientist`.
-   **Step 4:** `Employer` types "Hello".
-   **Expected:** `Scientist` sees "Typing..." indicator.
-   **Step 5:** `Employer` sends "Hello".
-   **Expected:** Message appears instantly on `Scientist`'s screen without refresh.
-   **Step 6:** `Scientist` opens the chat.
-   **Expected:** `Employer` sees double-check (Read Receipt) appear next to the message.

### 3.2 RBAC Enforcement (Security)
-   **Step 1:** Log in as `Random User`.
-   **Step 2:** Click "New Chat".
-   **Expected:** `Employer` and `Scientist` should **NOT** appear in the list (unless there is a valid project/job connection).
-   **Step 3:** Log in as `Employer`.
-   **Step 4:** Click "New Chat".
-   **Expected:** `Scientist` (who applied to their job) **SHOULD** appear.

### 3.3 AI Assistant (RAG)
-   **Step 1:** Log in as any user.
-   **Step 2:** Open chat with "Admin Bot".
-   **Step 3:** Ask: "What is the status of my project X?" (Ensure Project X exists).
-   **Expected:** Bot replies with correct status fetched from the DB/Context.
-   **Step 4:** Upload a PDF to a project and ask a question about its content.
-   **Expected:** Bot answers based on the PDF content.

### 3.4 Edge Cases
-   **Offline Messaging:** Send a message to an offline user. Log in as that user later. Verify message is present and "Unread" count is correct.
-   **Large Attachments:** Try to upload a file > 10MB. Expected: Error message "File too large".
-   **Concurrent Edits:** Two users typing in the same group chat simultaneously. Expected: No message loss or ordering issues.

## 4. Accessibility Checks
-   [ ] **Keyboard Nav:** Can you tab through the contact list and select a chat using `Enter`?
-   [ ] **Screen Reader:** Do new incoming messages announce themselves (e.g., via `aria-live` region)?
-   [ ] **Contrast:** Are the "Me" vs "Others" message bubbles distinct enough in high contrast mode?
-   [ ] **Focus Management:** When opening a chat, does focus move to the input field?
