 Batch 1.5: Template Component Library - PRD
Batch ID: 1.5
Version: 1.0
Last Updated: 2024-11-06
Status: Ready to Start
Prerequisites: Batch 1 Complete (Next.js setup, WowDash template, Prisma)
Duration Estimate: 1 day (6-8 hours)

Overview
Batch 1.5 converts WowDash HTML templates into reusable Next.js components that will be used throughout Batches 2-10. This prevents code duplication, ensures design consistency, and accelerates feature development.
Problem It Solves:

Copying HTML into every page creates maintenance nightmares
Static templates lack TypeScript safety and React interactivity
Inconsistent styling when developers reinvent components

Who It's For:

Feature developers building Batches 2-10
Future developers extending the platform

Why It's Valuable:

Build once, use everywhere (reusability)
TypeScript catches prop errors at compile time
Update styling once, changes reflect everywhere
Feature developers focus on logic, not recreating UI


Core Features
Feature 1: Component Extraction & Organization
What it does:
Identifies and extracts frequently-used UI patterns from WowDash html/ into standalone React components with TypeScript interfaces.
Priority Tiers:
Tier 1 - Auth (Blocks Batch 2):

AuthCard.tsx - Login/signup form wrapper
FormInput.tsx - Text input with label and validation

Tier 2 - Dashboard (Blocks Batch 3):

Sidebar.tsx - Navigation sidebar with role-based menus
Navbar.tsx - Top bar with user menu, notifications, theme toggle
StatWidget.tsx - Dashboard metric card (e.g., "5 Active Jobs")
EmptyState.tsx - Placeholder for empty lists

Tier 3 - Jobs/Profiles (Blocks Batch 4-5):

JobCard.tsx - Job listing preview
ApplicationCard.tsx - Application status display
ProfileCard.tsx - User profile summary
SearchBar.tsx - Search input with filters

Tier 4 - Projects (Blocks Batch 6):

ProjectCard.tsx - Project preview
TaskCard.tsx - Kanban task item (with drag-drop)
FileCard.tsx - Uploaded file display
CollaboratorAvatar.tsx - Team member avatar

Tier 5 - Utilities (Nice-to-Have):

Pagination.tsx, Badge.tsx, LoadingSkeleton.tsx, DataTable.tsx


Feature 2: Server vs Client Component Classification
What it does:
Properly categorizes components as Server (default) or Client Components ("use client") based on interactivity.
Server Components (No interactivity):

StatWidget, EmptyState, LoadingSkeleton, ProfileCard, Badge

Client Components (Requires "use client"):

Sidebar - Collapse/expand state
Navbar - Dropdown menus, notifications
JobCard - Save button, onClick handlers
SearchBar - Input state, filters
TaskCard - Drag-and-drop
FormInput - Input validation state

Rule: Add "use client" only if component uses:

Event handlers (onClick, onChange)
React hooks (useState, useEffect)
Browser APIs (localStorage, window)


Feature 3: TypeScript Interfaces & Documentation
What it does:
Defines strict TypeScript interfaces for all props with JSDoc comments.
Example:
typescript/**
 * Job listing card component
 * @example
 * <JobCard
 *   id="job-123"
 *   title="Research Scientist"
 *   jobType="remote"
 *   onSave={(id) => saveJob(id)}
 * />
 */
export interface JobCardProps {
  /** Unique job identifier */
  id: string
  
  /** Job title */
  title: string
  
  /** Optional company name */
  company?: string
  
  /** Work arrangement type */
  jobType: "remote" | "hybrid" | "on-site" | "contract"
  
  /** Optional save callback */
  onSave?: (jobId: string) => void
  
  /** Custom styling */
  className?: string
}

export function JobCard({ id, title, company, jobType, onSave }: JobCardProps) {
  // Implementation
}
Common Patterns:

id: string - Entity identifier
onClick?: () => void - Optional handlers
className?: string - Style overrides
children?: React.ReactNode - Composability


Feature 4: Next.js Optimizations
What it does:
Uses Next.js built-in components for performance.
Image Optimization:
typescriptimport Image from "next/image"
<Image src="/logo.png" alt="Logo" width={120} height={40} />
Link Optimization:
typescriptimport Link from "next/link"
<Link href={`/jobs/${id}`}>View Job</Link>
Components Requiring:

JobCard - Company logos
ProfileCard - User avatars
Navbar - Logo and avatar
All navigation links


Feature 5: Accessibility Standards
What it does:
Ensures WCAG 2.1 AA compliance with ARIA attributes and keyboard navigation.
Requirements per Component:

Semantic HTML (button, nav, aside, not divs)
Alt text on all images
aria-label on icon buttons
Keyboard accessibility (tabIndex, onKeyDown)
Visible focus states
WCAG AA color contrast (4.5:1)

Example:
typescript<button aria-label="Save job" onClick={onSave}>
  <BookmarkIcon />
</button>

<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick()
  }}
>
  Interactive Element
</div>
```

---

## User Experience

### Developer Persona

**Primary: Feature Developer**
- Building Batches 2-10 (auth, dashboards, jobs)
- Needs quick component imports with autocomplete
- Values clear examples and type safety

**Journey:**
1. Needs to display job list
2. Imports `JobCard` from `@/components/modules`
3. TypeScript shows required props
4. Passes data, component renders
5. Customizes with `className` if needed

---

### Component Organization
```
components/
├── ui/                      # Shadcn (already exists)
│   ├── button.tsx
│   ├── card.tsx
│   └── dialog.tsx
├── modules/                 # Batch 1.5 components
│   ├── auth/
│   │   ├── AuthCard.tsx
│   │   └── FormInput.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── StatWidget.tsx
│   │   └── EmptyState.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── ApplicationCard.tsx
│   │   └── SearchBar.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── TaskCard.tsx
│   │   └── FileCard.tsx
│   └── index.ts             # Barrel exports
└── layouts/
    └── DashboardLayout.tsx
Barrel Export:
typescript// components/modules/index.ts
export * from './auth/AuthCard'
export * from './dashboard/Sidebar'
export * from './jobs/JobCard'

// Usage
import { JobCard, Sidebar } from '@/components/modules'

Technical Architecture
Component Patterns
Server Component with Client Child:
typescript// Server Component (page)
export default async function JobsPage() {
  const jobs = await prisma.job.findMany()
  return <JobList jobs={jobs} />
}

// Client Component
"use client"
export function JobList({ jobs }: { jobs: Job[] }) {
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  return (
    <>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          {...job}
          onSave={(id) => setSavedJobs([...savedJobs, id])}
        />
      ))}
    </>
  )
}
Variants with CVA:
typescriptimport { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva("rounded-lg border", {
  variants: {
    size: {
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    }
  },
  defaultVariants: { size: "md" }
})

export interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode
}
Infrastructure
No Additional Packages:

Uses existing Next.js, React, Tailwind, Shadcn
class-variance-authority (already installed)
lucide-react (already installed)


Development Roadmap
Phase 1: Auth Components (2 hours)
Blocks: Batch 2 (Authentication)
Deliverables:

components/modules/auth/AuthCard.tsx
components/modules/auth/FormInput.tsx
TypeScript interfaces with JSDoc
Toast provider configured in root layout

Success Criteria:

Login/signup forms can be built
Form validation displays correctly
Types are exported


Phase 2: Dashboard Shell (3 hours)
Blocks: Batch 3 (Dashboards) and all subsequent batches
Deliverables:

components/modules/dashboard/Sidebar.tsx
components/modules/dashboard/Navbar.tsx
components/modules/dashboard/StatWidget.tsx
components/modules/dashboard/EmptyState.tsx
components/layouts/DashboardLayout.tsx

Success Criteria:

Dashboard layout renders
Sidebar highlights active route
User menu works
Theme toggle persists


Phase 3: Content Cards (2-3 hours)
Blocks: Batches 4-5 (Profiles & Jobs)
Deliverables:

components/modules/jobs/JobCard.tsx
components/modules/jobs/ApplicationCard.tsx
components/modules/jobs/SearchBar.tsx
components/modules/profiles/ProfileCard.tsx
Skeleton variants for loading states

Success Criteria:

Cards display data correctly
Interactive buttons work
Search filters update results


Phase 4: Project Components (2-3 hours)
Blocks: Batch 6 (Projects)
Deliverables:

components/modules/projects/ProjectCard.tsx
components/modules/projects/TaskCard.tsx (with @dnd-kit)
components/modules/projects/FileCard.tsx
components/modules/projects/CollaboratorAvatar.tsx

Success Criteria:

Task cards support drag-and-drop
File downloads work
Avatar tooltips show info


Phase 5: Utilities (Post-MVP, 1-2 hours)
Non-Blocking: Nice-to-have improvements
Deliverables:

Pagination.tsx, Badge.tsx, LoadingSkeleton.tsx, DataTable.tsx


Logical Dependency Chain
Critical Path:

Auth Components (2h) → Blocks Batch 2
Dashboard Shell (3h) → Blocks Batch 3+
Content Cards (2-3h) → Blocks Batch 4-5
Project Components (2-3h) → Blocks Batch 6
Utilities (1-2h) → Non-blocking polish

Parallelization:

JobCard and ApplicationCard can be built simultaneously
Sidebar and Navbar can be built simultaneously

Atomic Scoping:

Each component can be built in isolation
Start with static version, add interactivity later
Iterative: v1 (static) → v2 (props) → v3 (interactive)


Risks and Mitigations
Risk 1: Server vs Client Component Confusion
Issue: Developers forget "use client" directive, causing event handler errors.
Impact: Medium - Blocks development
Likelihood: High - Common Next.js mistake
Mitigation:

Clear documentation on when to use "use client"
Component templates with correct directive
Code review checklist

Solution:
typescript// If you see: "Functions cannot be passed to Client Components"
// Add at top of file:
"use client"

Risk 2: Prop Type Mismatches
Issue: Component expects enum but receives string.
Impact: Low - Caught at compile time
Likelihood: Medium
Mitigation:

Import types from Prisma: import type { JobType } from '@prisma/client'
Use Prisma enums in interfaces
Strict TypeScript config

Solution:
typescript// Import correct type
import type { JobType } from '@prisma/client'

interface JobCardProps {
  jobType: JobType // Not string
}

Risk 3: Inconsistent Styling
Issue: Different developers use different Tailwind classes for similar elements.
Impact: Medium - Visual inconsistency
Likelihood: Medium
Mitigation:

Use Shadcn components as base
WowDash tokens already in Tailwind config (Batch 1)
Create style constants file
Code review for consistency

Solution:
typescript// lib/constants/styles.ts
export const CARD_STYLES = {
  base: "rounded-lg border bg-card shadow-sm",
  hover: "hover:shadow-md transition-shadow",
  padding: "p-4"
}

// Use in components
<div className={CARD_STYLES.base}>...</div>

Risk 4: Component Bloat
Issue: Too many variants make components complex and hard to maintain.
Impact: Medium - Maintenance burden
Likelihood: Low (with discipline)
Mitigation:

Start with MVP version (minimal props)
Add variants only when needed by 2+ features
Use composition over configuration
Keep components under 150 lines

Solution:
typescript// ❌ Bad: Too many variants
<Button size="sm" variant="outline" color="primary" rounded="full" shadow="lg" />

// ✅ Good: Composition
<Button variant="outline" className="text-sm rounded-full shadow-lg" />

Risk 5: Missing Accessibility
Issue: Components don't work with keyboard or screen readers.
Impact: High - Legal/usability issues
Likelihood: Medium (if not prioritized)
Mitigation:

A11y checklist for each component
Use semantic HTML by default
Test with keyboard navigation
Run Axe DevTools during development

Checklist:
markdown- [ ] Semantic HTML (button, nav, not divs)
- [ ] Alt text on images
- [ ] aria-label on icon buttons
- [ ] Keyboard accessible (tabIndex)
- [ ] Focus states visible
- [ ] Color contrast WCAG AA

Appendix
Key References

Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
Next.js Link: https://nextjs.org/docs/app/api-reference/components/link
Server/Client Components: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
Shadcn/UI: https://ui.shadcn.com/docs/components
CVA (Variants): https://cva.style/docs
WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/


Component Checklist Template
markdown## [ComponentName] Checklist

**File:** `components/modules/[folder]/[ComponentName].tsx`

- [ ] TypeScript interface defined
- [ ] JSDoc documentation with examples
- [ ] "use client" directive (if interactive)
- [ ] Next.js Image/Link used
- [ ] Accessibility attributes
- [ ] Loading/error states
- [ ] Exported from barrel export
- [ ] Tested with sample data

Success Criteria
Batch 1.5 Complete When:

 All Tier 1-4 components built and documented
 Components exported from @/components/modules
 TypeScript interfaces with JSDoc
 Accessibility checklist passed per component
 At least one component from each tier tested in isolation
 No "use client" errors in console
 Ready to start Batch 2 (Authentication)