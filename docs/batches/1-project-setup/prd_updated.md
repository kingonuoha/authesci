# Overview

Batch 1.B completes the foundational setup of Authesci by integrating Prisma ORM as the database management layer between Next.js and Supabase PostgreSQL. This transforms the basic Supabase connection from Batch 1.A into a production-ready, type-safe database architecture.

**Problem It Solves:**

- No type safety for database queries
- No schema versioning or migration management
- Basic Supabase client not optimized for Next.js App Router SSR
- Manual SQL queries are error-prone

**Who It's For:**

- Development team building features in Batches 2-10
- Future developers maintaining the codebase

**Why It's Valuable:**

- Type-safe database queries catch errors at compile time
- Version-controlled schema changes with rollback capability
- Proper SSR setup prevents hydration and cookie issues
- Foundation for all future features (auth, jobs, projects)

# Core Features

**Feature 1: Prisma ORM Integration**

- **What it does:** Installs and configures Prisma as the ORM layer, connecting to Supabase PostgreSQL with type-safe query capabilities.
- **Why it's important:** Eliminates runtime database errors through TypeScript, standardizes database access patterns, and enables rapid development with autocomplete.
- **How it works:** Install Prisma packages → Initialize configuration → Configure DATABASE_URL → Create singleton client → Generate typed Prisma Client.
- **Reference:** Prisma with Supabase Guide

**Feature 2: Database Schema Definition**

- **What it does:** Translates Authesci database design into Prisma schema format with all tables, relationships, and constraints.
- **Why it's important:** Provides a single source of truth for database structure, automatic TypeScript type generation, and enforces data integrity with foreign keys.
- **How it works:** Define models in `prisma/schema.prisma` → Map to snake_case tables → Configure enums and relations → Validate syntax.
- **Key Models:** Profile, Job, Application, Project, Task, Collaborator, Payment, Notification, Subscription.
- **Reference:** Complete schema design in `/docs/database-schema.md`

**Feature 3: Database Migration System**

- **What it does:** Creates version-controlled SQL migration files and applies schema changes to Supabase database.
- **Why it's important:** Prevents manual SQL errors, enables schema rollback capability, and documents schema evolution.
- **How it works:** Run `prisma migrate dev` → Review generated SQL → Apply to database → Track migration history.
- **Reference:** Prisma Migration Guide

**Feature 4: Supabase SSR Upgrade**

- **What it does:** Upgrades basic Supabase client to SSR-compatible version using `@supabase/ssr` with separate utilities for Server Components, Client Components, and Middleware.
- **Why it's important:** Prevents hydration mismatches in App Router, is required for cookie-based authentication (Batch 2), and ensures session persistence across page refreshes.
- **How it works:** Install `@supabase/ssr` → Create three client utilities → Update middleware → Delete old basic client.
- **Client Types:**
  - `lib/supabase/server.ts` - Server Components (uses `next/headers`)
  - `lib/supabase/client.ts` - Client Components (browser storage)
  - `lib/supabase/middleware.ts` - Route protection (request/response cookies)
- **Reference:** Supabase SSR with Next.js
- **Note:** No authentication logic implemented here—that's Batch 2. This only sets up the clients.

**Feature 5: Database Utilities and Helpers**

- **What it does:** Provides reusable functions for error handling, type exports, and test data seeding.
- **Why it's important:** Reduces code duplication, improves error handling consistency, and enables quick testing with seed data.
- **How it works:** Create error handlers → Export Prisma types → Build seed script → Add database scripts to `package.json`.
- **Utilities:**
  - `lib/db/helpers.ts` - Error handling (unique constraints, not found, etc.)
  - `lib/db/types.ts` - TypeScript type exports for complex queries
  - `prisma/seed.ts` - Generate test scientist and employer profiles

# User Experience

**Developer Personas**

- **Primary: Feature Developer**
  - Building features in Batches 2-10
  - Needs type-safe queries with autocomplete
  - Values clear examples and error prevention
- **Secondary: DevOps Engineer**
  - Manages database migrations
  - Handles schema changes in production
  - Monitors database health

**Key Developer Flows**

- **Flow 1: First Database Query:** Import Prisma client → Write type-safe query → Get compile-time validation → Handle errors with utilities.
- **Flow 2: Schema Changes:** Update `prisma/schema.prisma` → Run migration → Review SQL → Apply to database → Commit migration files.
- **Flow 3: Viewing Data:** Run `npm run db:studio` → Browse tables in Prisma Studio → Inspect relationships → Test queries.

**DX Considerations**

- **Discoverability:** All utilities in `@/lib/*` with consistent naming.
- **Error Messages:** User-friendly error formatting via helper functions.
- **Visual Tools:** Prisma Studio for database browsing.
- **Type Safety:** IDE shows errors before runtime.

# Technical Architecture

**System Components**

- **Next.js App Router**
  - ├── Server Components (`lib/supabase/server.ts` + `lib/prisma.ts`)
  - ├── Client Components (`lib/supabase/client.ts`)
  - ├── Middleware (`lib/supabase/middleware.ts`)
  - └── API Routes (`lib/prisma.ts`)
-       ↓
- **Prisma Client** (Generated TypeScript Types)
-       ↓
- **Supabase PostgreSQL** (Tables, Constraints, Indexes)

**Data Models**

- **Reference:** `/docs/database-schema.md` for complete schema.
- **Key Prisma Patterns:**
  - `PascalCase` models → `snake_case` tables via `@@map()`.
  - UUID primary keys for distributed compatibility.
  - Soft deletes with `deletedAt` field.
  - Cascading deletes via `onDelete: Cascade`.
  - Unique constraints prevent duplicates (e.g., job applications).
- **Core Models:**
  - `Profile` → `jobsPosted` (1:M), `applications` (1:M), `projectsCreated` (1:M)
  - `Job` → `applications` (1:M)
  - `Application` → `job` (M:1), `applicant` (M:1)
  - `Project` → `collaborators` (1:M), `files` (1:M), `tasks` (1:M)

**APIs and Integrations**

- **Prisma Client API:**
  - CRUD: `create()`, `findUnique()`, `update()`, `delete()`
  - Relations: `include: { relation: true }`
  - Transactions: `$transaction([])`
- **Supabase Integration:**
  - No direct auth calls in this batch.
  - SSR clients prepared for Batch 2 authentication.
  - Cookie handling configured for session management.
- **Reference:** Prisma Client API

**Infrastructure Requirements**

- **Environment Variables:**
  - `DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"`
  - `DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"`
  - `NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"`
- **Database:** PostgreSQL 14+ (Supabase)
- **Development Tools:** Prisma Studio, Supabase Dashboard, VS Code Prisma Extension

# Development Roadmap

### Phase 1: Prisma Core Setup (MVP)

- **Goal:** Install and connect Prisma to Supabase.
- **Requirements:**
  - Install `prisma` and `@prisma/client`.
  - Run `npx prisma init`.
  - Configure `DATABASE_URL` from Supabase.
  - Create singleton Prisma client (`lib/prisma.ts`).
  - Add Prisma scripts to `package.json`.
- **Success Criteria:** Prisma CLI runs without errors, can import `prisma` in Server Component, no connection errors.
- **Deliverables:** `prisma/schema.prisma` (basic setup), `lib/prisma.ts` (singleton), updated `.env.local`.

### Phase 2: Schema Definition (MVP)

- **Goal:** Define all database tables in Prisma schema.
- **Requirements:**
  - Create all models from `/docs/database-schema.md`.
  - Define enums (Role, JobStatus, ApplicationStatus, etc.).
  - Establish bidirectional relations.
  - Add unique constraints.
  - Map Prisma names to snake_case tables.
  - Validate with `npx prisma validate`.
- **Success Criteria:** Schema validation passes, all PRD tables represented, relations are bidirectional.
- **Deliverables:** Complete `prisma/schema.prisma`, validation report.

### Phase 3: Initial Migration (MVP)

- **Goal:** Apply schema to Supabase database.
- **Requirements:**
  - Run `npx prisma migrate dev --name init`.
  - Review generated SQL.
  - Verify in Supabase dashboard.
  - Generate Prisma Client types.
- **Success Criteria:** Tables visible in Supabase, migration status "up to date", TypeScript types generated.
- **Deliverables:** Migration files in `prisma/migrations/`, generated Prisma Client, populated Supabase database.

### Phase 4: Supabase SSR Upgrade (MVP)

- **Goal:** Replace basic client with SSR-compatible version.
- **Requirements:**
  - Install `@supabase/ssr`.
  - Create `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`.
  - Update `middleware.ts` for cookie refresh.
  - Delete old `lib/supabase.ts`.
- **Success Criteria:** No hydration errors, cookies handled correctly, session refresh works in middleware.
- **Deliverables:** Three Supabase client files, updated middleware, documentation on client usage.

### Phase 5: Database Utilities (MVP)

- **Goal:** Create helper functions and seed data.
- **Requirements:**
  - Create `lib/db/helpers.ts` (error handling) and `lib/db/types.ts` (type exports).
  - Create `prisma/seed.ts` (test data).
  - Install `tsx` for TypeScript execution.
  - Add `db:seed` and `db:studio` scripts.
  - Document utilities with JSDoc.
- **Success Criteria:** Error helpers identify Prisma error types, seed creates test profiles, Prisma Studio opens successfully.
- **Deliverables:** `lib/db/helpers.ts`, `lib/db/types.ts`, `prisma/seed.ts`, updated `package.json`.

### Phase 6: Documentation (MVP)

- **Goal:** Document setup and usage.
- **Requirements:**
  - Update `docs/template-integration.md` with Prisma section.
  - Create `docs/database-schema.md` with Prisma reference.
  - Document migration workflow.
  - Add troubleshooting guide.
- **Success Criteria:** Documentation covers all steps, new developer can set up from docs.
- **Deliverables:** Updated `/docs/template-integration.md`, new `/docs/database-schema.md`.

### Future Enhancements (Post-MVP)

- **Batch 2+ Improvements:** Prisma middleware for auto-timestamps, soft delete utilities, full-text search.
- **Batch 9 Developer Tools:** Schema diff viewer, migration rollback automation.
- **Batch 10 Production Hardening:** Connection retry, query timeout, health check endpoints.

# Logical Dependency Chain

### Build Order (Sequential Dependencies)

1.  **Prisma Installation (Foundation):** All other phases require a working Prisma CLI.
2.  **Schema Definition (Data Structure):** Migrations need a schema to generate SQL.
3.  **Initial Migration (Database Tables):** Creates tables in Supabase, enabling queries.
4.  **Supabase SSR Clients (Quick Win):** Prepares for Batch 2 authentication.
5.  **Seed Data (Testing):** Allows for immediate query testing and visual verification.
6.  **Utilities (Polish):** Built based on observed usage patterns for better error handling.
7.  **Documentation (Knowledge Transfer):** Done last to document the final, working system.

### Atomic Scoping

Each phase is independently completable:

- **Phase 1:** Can install without a schema.
- **Phase 2:** Can define a schema without migrating.
- **Phase 3:** Can create a migration without applying it.
- **Phase 4:** Can set up clients independently.
- **Phase 5:** Can add utilities incrementally.
- **Phase 6:** Can document as you build.

# Risks and Mitigations

### Technical Challenges

- **Risk 1: Migration Conflicts:**
  - **Mitigation:** One schema owner for this batch, use feature branches, run `migrate dev` immediately after pull.
  - **Fallback:** `npx prisma migrate reset` in development.
- **Risk 2: Connection Limits:**
  - **Mitigation:** Use singleton pattern, `connection_limit=1` in dev, enable Supabase pooling.
  - **Fallback:** Restart dev server.
- **Risk 3: Type Generation Failures:**
  - **Mitigation:** Run `npx prisma validate` before generate, use `postinstall` script.
  - **Fallback:** Delete `node_modules` and reinstall.
- **Risk 4: SSR Cookie Errors:**
  - **Mitigation:** Use the correct Supabase client per context (Server, Client, Middleware), test all contexts.
  - **Fallback:** Revert to basic client temporarily.

### MVP Definition

- **Must Have (Blocks Batch 2):**
  - ✅ Prisma installed and configured
  - ✅ Complete schema with all tables
  - ✅ Migration applied to Supabase
  - ✅ Prisma Client generating types
  - ✅ SSR clients for Server/Client/Middleware
  - ✅ Test data seeded
- **Should Have (Improves DX):**
  - ✅ Error handling utilities
  - ✅ Type export helpers
  - ✅ Prisma Studio script
- **Nice to Have (Post-MVP):**
  - ⏸️ Advanced type utilities
  - ⏸️ Soft delete helpers

### Resource Constraints

- **Supabase Free Tier:** 500 MB storage, 15 connection limit. The singleton pattern mitigates the connection limit.
- **Time Budget:** 4-6 hours.
- **Knowledge Requirement:** Familiarity with Next.js App Router cookie handling is crucial for the SSR setup.

# Appendix

### A. Key References

- **Prisma with Supabase:** `https://www.prisma.io/docs/guides/database/supabase`
- **Prisma Migrations:** `https://www.prisma.io/docs/concepts/components/prisma-migrate`
- **Supabase SSR Guide:** `https://supabase.com/docs/guides/auth/server-side/nextjs`
- **Prisma Client API:** `https://www.prisma.io/docs/concepts/components/prisma-client`
- **Database Schema Reference:** `/docs/database-schema.md`

### B. File Structure

```
authesci-app/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Test data
│   └── migrations/         # Version-controlled SQL
├── lib/
│   ├── prisma.ts           # Singleton client
│   ├── supabase/
│   │   ├── server.ts       # Server Component client
│   │   ├── client.ts       # Client Component client
│   │   └── middleware.ts   # Middleware client
│   └── db/
│       ├── helpers.ts      # Error handling
│       └── types.ts        # Type exports
├── docs/
│   ├── database-schema.md  # Schema reference
│   └── template-integration.md
└── middleware.ts           # Cookie refresh
```
