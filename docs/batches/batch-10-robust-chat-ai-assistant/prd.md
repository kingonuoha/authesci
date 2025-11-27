# Product Requirements Document: Batch 10 - Robust Chat & AI Assistant

## 1. Overview
This batch introduces a comprehensive, real-time messaging system to Authesci, facilitating secure and role-based communication between Scientists, Employers, and Collaborators. It extends beyond simple text exchange by integrating an "Admin-level" AI assistant capable of RAG (Retrieval-Augmented Generation) over project files and system data. The system ensures privacy through strict Role-Based Access Control (RBAC) and enhances user engagement with presence indicators and read receipts.

## 2. Goals & Success Metrics
### Goals
- **Enable Seamless Communication:** Provide a real-time, reliable messaging channel for project coordination.
- **Enhance User Support:** Deploy an AI assistant to handle common queries and provide context-aware project insights.
- **Ensure Data Privacy:** Strictly enforce RBAC so users only communicate with authorized contacts.
- **Improve Engagement:** Use presence and status indicators to make the platform feel alive.

### Success Metrics
- **Latency:** Message delivery < 200ms.
- **AI Accuracy:** > 90% relevance in RAG responses (measured by user feedback/thumbs up).
- **Adoption:** > 70% of active projects utilizing the chat feature within the first week.
- **Support Load:** 30% reduction in human admin support tickets due to AI resolution.

## 3. User Stories & Acceptance Criteria

### 3.1 Real-Time Messaging
**As a User (Any Role),** I want to send and receive messages instantly so that I can collaborate efficiently.
- **AC1:** Messages appear in the chat window in real-time without page refresh (Supabase Realtime).
- **AC2:** "Typing..." indicators appear when the other user is typing.
- **AC3:** User status (Online/Offline) and "Last Seen" timestamps are accurate.
- **AC4:** Read receipts (double ticks) appear when the recipient has viewed the message.

### 3.2 Role-Based Access Control (RBAC)
**As a User,** I want to only be able to contact relevant people so that I don't get spammed or breach privacy.
- **AC1:** **Employers** can only initiate chats with Applicants (active jobs), Collaborators (active projects), AI, and Admins.
- **AC2:** **Scientists** can only initiate chats with Employers (hired projects), Referrals, AI, and Admins.
- **AC3:** **Admins** can chat with any user.
- **AC4:** The "New Chat" modal filters the contact list based on these rules.

### 3.3 Group Chats
**As a Project Manager,** I want to create group chats for my project team so we can discuss topics collectively.
- **AC1:** Users can select multiple valid contacts to start a group chat.
- **AC2:** Group chats are distinct threads; 1:1 message history is NOT imported.
- **AC3:** Group members can be added or removed by the creator/admin.

### 3.4 AI Assistant ("Admin Bot")
**As a User,** I want to ask an AI assistant about my project files and account status so I can get quick answers.
- **AC1:** Users have a persistent 1:1 chat with "Admin Bot".
- **AC2:** The bot can answer questions based on uploaded Project Files (PDF/Doc) using RAG.
- **AC3:** The bot can answer questions about system info (e.g., "Is my profile complete?", "What is my active project status?").
- **AC4:** Bot responses are clearly marked as AI-generated.

### 3.5 Search & Media
**As a User,** I want to search past messages and send files so that I can find information and share documents.
- **AC1:** Global search bar filters messages across all conversations.
- **AC2:** Users can upload images and files (via Cloudinary).
- **AC3:** Images display as optimized previews; files appear as downloadable links.

## 4. UX & Design References
- **Layout:** Split view. Left sidebar for conversation list (with search, "New Chat" button, online status). Right pane for active chat thread.
- **Mobile:** Stacked view. List view navigates to full-screen chat view.
- **Components:**
  - `ChatBubble`: Distinct styles for "Me", "Others", and "AI".
  - `TypingIndicator`: Subtle 3-dot animation.
  - `ContactList`: Avatar + Name + Last Message preview + Unread badge.
  - `AttachmentPreview`: Thumbnail for images, icon + name for files.

## 5. Data Model Changes
We will introduce `Conversation`, `Participant`, and `Message` models and update the `Profile` model.

```prisma
// prisma/schema.prisma

enum ConversationType {
  DIRECT
  GROUP
  AI_SUPPORT
}

enum AttachmentType {
  IMAGE
  FILE
  AUDIO
}

model Conversation {
  id        String           @id @default(uuid())
  type      ConversationType
  name      String?          // Null for 1:1, Required for named Groups
  
  // Contextual Links
  projectId String?          @map("project_id")
  jobId     String?          @map("job_id")

  createdAt DateTime         @default(now()) @map("created_at")
  updatedAt DateTime         @updatedAt @map("updated_at")

  participants Participant[]
  messages     Message[]

  @@map("conversations")
}

model Participant {
  conversationId String   @map("conversation_id")
  userId         String   @map("user_id")
  role           String?  // 'ADMIN', 'MEMBER'
  
  joinedAt       DateTime @default(now()) @map("joined_at")
  lastReadAt     DateTime @default(now()) @map("last_read_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           Profile      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([conversationId, userId])
  @@map("participants")
}

model Message {
  id             String          @id @default(uuid())
  conversationId String          @map("conversation_id")
  senderId       String?         @map("sender_id") // Nullable for SYSTEM/AI
  
  content        String          @db.Text
  
  attachmentUrl  String?         @map("attachment_url")
  attachmentType AttachmentType? @map("attachment_type")

  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         Profile?     @relation(fields: [senderId], references: [id])

  @@map("messages")
}

// Update existing Profile model
model Profile {
  // ... existing fields
  participations Participant[]
  messagesSent   Message[]
}
```

## 6. Component Architecture

### Server Components
- `ChatLayout`: Manages the overall grid structure.
- `ConversationList`: Fetches the initial list of conversations for the user.
- `ChatThread`: Fetches the initial messages for a selected conversation.

### Client Components
- `RealtimeProvider`: Subscribes to Supabase Realtime channels for new messages and status updates.
- `MessageInput`: Handles text input, file selection, and "Typing..." events.
- `MessageBubble`: Renders individual messages with proper styling and attachment handling.
- `NewChatModal`: Handles contact searching and filtering based on RBAC.
- `SearchSidebar`: Client-side filtering of the conversation list.

## 7. Implementation Plan

### Phase 1: Database & Backend
1.  Update `prisma/schema.prisma` with new models.
2.  Run migration: `npx prisma migrate dev --name add_chat_system`.
3.  Create server actions: `sendMessage`, `createConversation`, `markAsRead`, `getConversations`.

### Phase 2: Real-time Infrastructure
1.  Initialize Supabase Client in `RealtimeProvider`.
2.  Set up channel subscriptions for `INSERT` on `messages` table.
3.  Implement "Presence" state for Online/Offline tracking.

### Phase 3: UI Implementation
1.  Build `ChatLayout` and `ConversationList` sidebar.
2.  Build `ChatThread` view with `MessageBubble` components.
3.  Implement `MessageInput` with file upload integration (Cloudinary).
4.  Create `NewChatModal` with RBAC logic.

### Phase 4: AI Integration
1.  Set up Google Gemini API client.
2.  Implement RAG pipeline:
    -   Trigger on `ProjectFile` upload -> Generate Embeddings -> Store in Vector DB.
    -   `sendMessage` action detects AI chat -> Queries Vector DB -> Calls Gemini -> Streams response.

## 8. Risks & Dependencies
-   **Risk:** Real-time connection limits on Supabase free tier.
    -   *Mitigation:* Monitor usage and implement connection pooling/throttling if necessary.
-   **Risk:** AI Hallucinations.
    -   *Mitigation:* Strict system prompts for Gemini, citing sources from RAG context.
-   **Dependency:** Cloudinary for file storage.
-   **Dependency:** Google Gemini API key.

## 9. MCP Tools & Resources
This section lists tools that the implementation team should use during development.

-   **`supabase` MCP Tool:**
    -   *Usage:* Verify database schema changes and check RLS policies.
    -   *Command:* `get_project` to check status, `execute_sql` (carefully) to verify table creation if needed.
-   **`context7` MCP Tool:**
    -   *Usage:* Fetch latest documentation for `@google/generative-ai` and `supabase-js` realtime features.
-   **`firecrawl-mcp` Tool:**
    -   *Usage:* If external documentation is needed for specific library versions.
