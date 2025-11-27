# AI Development Tips & Lessons Learned

## Overview
This document captures key learnings, patterns, and best practices discovered during the development of Authesci's AI features (Batch 8). Future developers should refer to this when extending AI capabilities or debugging existing ones.

## 1. Vector Search & Embeddings

### Implementation Details
- **Library:** We use `google-generative-ai` (Gemini) for generating text embeddings.
- **Database:** Supabase (PostgreSQL) with `pgvector` extension.
- **Prisma:** We use `Unsupported("vector")` type in schema and `prisma.$executeRaw` / `prisma.$queryRaw` for vector operations.

### Lessons Learned
- **Type Casting:** Prisma doesn't natively support vector types in TypeScript yet. We must cast embeddings to strings (e.g., `[0.1, 0.2, ...]`) before passing them to raw SQL queries.
- **Dimensionality:** Ensure the database vector column dimension matches the model's output (Gemini `text-embedding-004` uses 768 dimensions).
- **Indexing:** For performance on large datasets, an IVFFlat index is recommended on the `aiFeatureVector` column.

### Common Pitfalls
- **Missing Extension:** Always ensure `CREATE EXTENSION IF NOT EXISTS vector;` is run in the database migration.
- **Null Vectors:** Handle cases where `aiFeatureVector` is null (legacy data) gracefully in search queries.

## 2. AI-Powered Job Matching

### Logic
- **Profile Embedding:** Generated from `skills`, `bio`, and `experience`.
- **Job Embedding:** Generated from `title`, `description`, and `requirements`.
- **Ranking:** We calculate cosine similarity (1 - cosine distance) between profile and job vectors.

### Observations
- **Hybrid Search:** Pure vector search can miss exact keyword matches (e.g., specific tools). A hybrid approach (Vector + Keyword Filter) is often better.
- **Latency:** Embedding generation adds latency. It's best to generate embeddings asynchronously (e.g., via background jobs or queues) rather than blocking the user request. Currently, we do it inline for simplicity but this should be optimized.

## 3. Notifications System

### Architecture
- **Dual Channel:** Notifications are sent via In-App (Database) and Email (Nodemailer).
- **Real-time:** We use polling (every 60s) in `NotificationBell` for simplicity. For true real-time, Supabase Realtime or WebSockets should be used.

### Best Practices
- **Idempotency:** Ensure notification actions (like "Mark as Read") are idempotent.
- **Batching:** When sending bulk notifications (e.g., "New Job Alert" to 1000 users), use a queue system (like BullMQ) to avoid timeouts and rate limits.

## 4. Image Handling (Cropping)

### Implementation
- **Library:** `react-easy-crop` for the UI.
- **Process:** Client-side cropping -> Canvas blob generation -> Upload to Cloudinary.

### Tips
- **File Types:** Always convert the canvas blob to `image/png` or `image/jpeg` explicitly to avoid issues with transparency or file size.
- **Aspect Ratio:** Enforce 1:1 for avatars and logos to ensure UI consistency.

## 5. Environment Variables & Feature Flags

- **`NEXT_PUBLIC_ENABLE_AI_FEATURES`:** We use this flag to conditionally render AI UI elements and skip AI logic in backend actions. This is crucial for testing and cost control.
- **`SMTP_HOST`:** In development, if SMTP is missing, we log emails to the console instead of crashing. This improves the developer experience (DX).

## 6. Future Improvements

- **RAG (Retrieval-Augmented Generation):** For even better cover letters, we could retrieve similar successful applications (anonymized) to guide the generation.
- **Feedback Loop:** Capture user feedback (e.g., "Not relevant" on job recommendations) to fine-tune the matching algorithm.