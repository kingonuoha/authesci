---
description: AI development guidelines for Authesci project
globs: "**/*"
alwaysApply: true
---

# AI Development Workflow for Authesci

## 1. Primary Directive

Expert AI assistant for Authesci. Understand requirements from documentation and implement features following project architecture and standards.

---

## 2. Source of Truth Documents

**Always consult before starting tasks:**

- **Project Vision:** `docs/batches/SOURCE_OF_TRUTH.md` - Main PRD with vision, roles, modules, tech stack
- **Batch PRDs:** `docs/batches/[batch-name]/prd.md` - Specific requirements per batch
- **Database Schema:** `docs/context/database-schema.md` - Data models and relationships
- **UI/UX Guidelines:** `docs/context/ui-ux.md` - Design principles, component usage, accessibility

---

## 3. Core Workflow

### Step 1: Understand Task
- Analyze request
- Cross-reference with SOURCE_OF_TRUTH.md and batch PRD
- Identify features, requirements, dependencies

### Step 2: Locate Files
- **App code:** `authesci-app/`
- **Components:** `authesci-app/components/`
  - `ui/` - Shadcn components
  - `modules/` - Custom domain components
- **Routes:** `authesci-app/app/` (Next.js App Router)
- **Database:** `authesci-app/prisma/schema.prisma`, `authesci-app/lib/prisma.ts`
- **Supabase:** `authesci-app/lib/supabase/` (server.ts, client.ts, middleware.ts)
- **API Routes:** `authesci-app/app/api/`
- **Server Actions:** `authesci-app/app/actions/`

### Step 3: Implementation
- **Follow:** ESLint config and Prettier formatting
- **UI:** Use Shadcn for primitives, custom components for domain logic, adapt WowDash for layouts
- **Database:** Use Prisma singleton, update schema + migrate, use correct Supabase client
- **Components:** Server by default, Client only for interactivity, TypeScript interfaces with JSDoc
- **Reference:** `docs/context/ui-ux.md` and `docs/context/database-schema.md`

### Step 4: Completion
- Verify functionality works per PRD
- Check code follows structure and UI/UX guidelines
- Test accessibility and responsiveness
- No errors or warnings

---

## 4. Best Practices

- Use `[filename](mdc:path)` for file references
- Provide formatted code blocks with explanations
- Maintain consistency with existing patterns
- Use strict TypeScript (no `any`)
- Follow WCAG 2.1 AA accessibility
- Prefer Server Components for performance

---

## 5. Available MCP Tools

### Development & Documentation
- **context7:** Get latest docs and code examples for any library

### Database & Backend
- **supabase:** Query database, get Supabase docs, check RLS policies
  - Query data: `SELECT * FROM profiles LIMIT 5`
  - Get docs: Auth SSR, Realtime, Storage
  - Use for understanding state, NOT for writing production data

### Web & Content
- **firecrawl-mcp:** Scrape documentation and extract structured data

### Task Management
- **task-master-ai:** Create, update, track tasks from PRDs

### Version Control
- **github:** Create branches, push commits, create PRs (DO NOT MERGE)

### Testing & QA
- **playwright:** Automated UI testing, cross-browser checks
- **vibe-check-mcp-server:** Visual consistency checks, design compliance

---

## 6. Database Guidelines

### Using Supabase MCP
**Use for:**
- Understanding current database state
- Verifying migrations applied
- Getting Supabase-specific documentation

**Do NOT use for:**
- Writing production data (use Prisma)
- Complex transactions (use Prisma)
- Application logic (use server actions)

### Using Prisma Client
**Always use for:**
- CRUD operations in server actions
- Complex queries with joins
- Transactions
- Type-safe database access

### Schema Changes
1. Check current structure with Supabase MCP
2. Update `prisma/schema.prisma`
3. Run `npx prisma migrate dev --name description`
4. Verify with Supabase MCP

---

## 7. Git Workflow

### On Task Completion:
1. **Create branch:** `feat/brief-description` (max 7 words)
2. **Commit:** Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
3. **Push:** To `https://github.com/kingonuoha/authesci`
4. **DO NOT MERGE TO MAIN**
5. **Optional PR:** If requested, with description and task list

---

## 8. Quality Checklist

### Code
- [ ] Strict TypeScript (no `any`)
- [ ] ESLint clean
- [ ] Prettier formatted
- [ ] No console.log in production
- [ ] Error handling implemented

### UI/UX (if applicable)
- [ ] Follows ui-ux.md guidelines
- [ ] Responsive on all screens
- [ ] Keyboard accessible
- [ ] ARIA attributes added
- [ ] Loading/error/empty states

### Database (if applicable)
- [ ] Prisma schema updated and migrated
- [ ] Verified with Supabase MCP
- [ ] RLS policies considered
- [ ] Data validation implemented

### Testing
- [ ] Manually tested
- [ ] Edge cases considered
- [ ] Error scenarios handled

---

## 9. Common Issues & Solutions

### "Functions cannot be passed to Client Components"
**Solution:** Add `"use client"` directive at top of file

### Hydration Errors
**Solution:** Ensure Server/Client boundary correct, check datetime/random values

### Type Errors
**Solution:** Import types from Prisma Client: `import type { Role } from '@prisma/client'`

### Missing Prisma Types
**Solution:** Run `npx prisma generate`

### Migration Failed
**Solution:** Check error, fix schema, run `npx prisma migrate reset` (dev only)

---

**End of AI Development Workflow**