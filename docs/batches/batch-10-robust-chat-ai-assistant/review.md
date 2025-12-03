# Batch 10 Review: Robust Chat & AI Assistant

## Quick Start
1.  **Environment Variables:** Ensure `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set in `.env`.
2.  **Database:** Run `npx prisma db push` to apply schema changes (Chat models, RAG fields).
3.  **Dependencies:** Run `npm install` to install `@google/generative-ai`, `cloudinary`, `pdf-parse`, `mammoth`.
4.  **Run:** Start the dev server with `npm run dev`.

## Features Implemented
1.  **Real-time Chat:**
    *   Direct and Group messaging.
    *   Real-time updates via Supabase Realtime (new messages, typing indicators, online status).
    *   "Last Seen" timestamps for offline users.
    *   Read receipts (visual indicator).
2.  **File Sharing:**
    *   Secure direct uploads to Cloudinary.
    *   Support for Images and Documents.
    *   Automatic RAG processing for uploaded files (text extraction + embedding generation).
3.  **AI Assistant (RAG):**
    *   Dedicated "Authesci AI" support chat.
    *   Context-aware responses using RAG (Retrieval-Augmented Generation).
    *   Retrieves relevant content from project files the user has access to.
    *   Uses Google Gemini `embedding-001` for vector search and `gemini-pro` for chat.
4.  **Role-Based Access Control (RBAC):**
    *   Contact search filtered by user role (Employer vs Scientist).
    *   Project file access control in RAG queries.

## Test Cases

### 1. Real-time Messaging
*   **Action:** Open chat in two different browsers/incognito windows with different users. Send a message.
*   **Expected:** Message appears instantly in the other window without refresh.
*   **Action:** Start typing in one window.
*   **Expected:** "Someone is typing..." appears in the other window.

### 2. File Upload & RAG
*   **Action:** Upload a PDF with specific content (e.g., "Project Alpha Secret Code: 12345") to a project.
*   **Expected:** File uploads successfully and appears in the project files list.
*   **Action:** Go to "Authesci AI" chat and ask "What is the secret code for Project Alpha?".
*   **Expected:** AI responds with "12345" (citing the file context).

### 3. Online Status & Last Seen
*   **Action:** User A is online. User B views User A in chat list.
*   **Expected:** Green dot indicates User A is online.
*   **Action:** User A closes the tab/logs out.
*   **Expected:** Green dot disappears, replaced by "Last seen [time] ago".

### 4. RBAC Search
*   **Action:** Log in as Employer. Click "New Chat". Search for a Scientist.
*   **Expected:** Scientist appears in results.
*   **Action:** Log in as Scientist. Search for another Scientist (who is not a collaborator/admin).
*   **Expected:** User might not appear (depending on strictness of current filter).

## Known Issues / Limitations
*   **RAG Latency:** Initial file processing for RAG happens asynchronously; embeddings might take a few seconds to populate after upload.
*   **File Types:** Text extraction currently supports PDF, DOCX, and TXT. Images are uploaded but not OCR'd for RAG yet.
*   **Prisma EPERM:** Occasional file locking issues on Windows during `prisma generate` if dev server is running. Restarting the server resolves this.

## Accessibility
*   **Keyboard Nav:** Chat input, message list, and modal are keyboard accessible.
*   **Screen Readers:** Basic ARIA labels added to interactive elements.
