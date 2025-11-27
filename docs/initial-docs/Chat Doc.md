This PRD consolidates the functional requirements and the data model changes for Batch 10: Robust Chat & AI Assistant.

Product Requirements Document (PRD): Batch 10 - Robust Chat & AI Assistant
1. Overview
A real-time, context-aware messaging system enabling secure, role-based communication between Scientists, Employers, and Collaborators. The module includes an "Admin-level" AI assistant capable of reading project files (RAG), group chat formation, and global message search.

2. Core Features
2.1. Real-Time Messaging & Presence
Infrastructure: Supabase Realtime (WebSockets) for instant delivery.

Presence: "Online" status (green dot) and "Last Seen" timestamps.

Indicators: Ephemeral "Typing..." indicators broadcasted to active participants.

Read Receipts: Unread message counts calculated via lastReadAt timestamps per participant.

2.2. Role-Based Access Control (RBAC)
Employer: Can chat with Applicants (active jobs), Collaborators (active projects), AI, and Admins.

Scientist: Can chat with Employers (hired projects), Referrals (future), AI, and Admins.

Admin: Unrestricted access to chat with any user.

Discovery: A "New Chat" modal filters available contacts based strictly on these rules.

2.3. Group Chats
Creation: Users can select multiple valid contacts to form a new group context.

State: Groups start as fresh threads; 1:1 history is not imported.

2.4. AI Assistant ("Admin Bot")
Capabilities: 1:1 chat interface for every user.

Knowledge Base:

Project Files: RAG (Retrieval-Augmented Generation) using pgvector to query PDF/Doc content in ProjectFiles.

System Info: Answers questions regarding account status and app usage.

Tech: Google Gemini (@google/generative-ai) + Supabase Vector Store.

2.5. Search & Media
Global Search: Full-text search across all accessible conversation histories.

Media: Cloudinary storage for images (optimized previews) and file attachments.

3. Data Model (Prisma Schema)
Add the following models to your schema.prisma. This implementation decouples "Messages" from "Users" to support scalable Group and AI chats.

Code snippet

// --- Enums ---

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

// --- Models ---

model Conversation {
  id        String           @id @default(uuid())
  type      ConversationType
  name      String?          // Null for 1:1, Required for named Groups
  
  // Contextual Links (Optional)
  projectId String?          @map("project_id")
  jobId     String?          @map("job_id") // If chat is initiated via a Job Application

  createdAt DateTime         @default(now()) @map("created_at")
  updatedAt DateTime         @updatedAt @map("updated_at")

  // Relations
  participants Participant[]
  messages     Message[]

  @@map("conversations")
}

model Participant {
  conversationId String   @map("conversation_id")
  userId         String   @map("user_id")
  role           String?  // 'ADMIN', 'MEMBER' (useful for Group management)
  
  joinedAt       DateTime @default(now()) @map("joined_at")
  lastReadAt     DateTime @default(now()) @map("last_read_at") // Used to calc unread counts

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           Profile      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([conversationId, userId]) // Composite ID ensures unique membership
  @@map("participants")
}

model Message {
  id             String          @id @default(uuid())
  conversationId String          @map("conversation_id")
  senderId       String?         @map("sender_id") // Nullable: If null, the sender is the SYSTEM/AI
  
  content        String          @db.Text
  
  // Attachments
  attachmentUrl  String?         @map("attachment_url")
  attachmentType AttachmentType? @map("attachment_type")

  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at") // For edits

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         Profile?     @relation(fields: [senderId], references: [id])

  @@map("messages")
}

// --- Updates to Existing Models ---

// Add this relation to your existing `Profile` model
// model Profile {
//   ... existing fields ...
//   participations Participant[] // Add this line
//   messagesSent   Message[]     // Add this line
// }
4. Technical Strategy
Realtime: Use Supabase Client SDK (supabase.channel) to subscribe to the messages table for INSERT events.

RAG Pipeline:

Trigger: ProjectFile upload.

Action: Parse text -> Generate Embeddings (Gemini) -> Store in project_file_embeddings (SQL-only table or separate Prisma model if using vector extension explicitly).

Security: Implement API-level validation ensuring auth.uid() exists in the Participant table for the requested conversationId before fetching messages.