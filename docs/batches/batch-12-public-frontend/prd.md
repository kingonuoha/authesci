# Batch 12: Public Frontend & Brand Identity - PRD

## 1. Overview
**Title:** Public Frontend & Brand Identity
**Slug:** batch-12-public-frontend
**Description:** This batch focuses on building the external-facing pages of Authesci (Home, About, Contact, Legal). Unlike the functional dashboard, these pages are designed for **marketing, trust-building, and conversion**. We will implement a distinct visual identity using the `front-page` templates, separate from the application dashboard.
**Primary Persona:** The "Skeptical Researcher" – needs immediate proof of value, legitimacy, and relevance to the African context before signing up.

## 2. Goals & Metrics
*   **Conversion (Growth):** Increase Visitor-to-Signup rate for Scientists.
*   **Trust (Psychology):** Reduce bounce rate by addressing the "Empty State" fear with social proof and clear verification explanations.
*   **SEO (Visibility):** Rank for keywords like "African research collaboration", "Science jobs in Africa".
*   **Brand Positioning:** Establish Authesci as "Africa's premier research hub".

## 3. User Stories & Acceptance Criteria

### 3.1 Home Page (The "Hook")
**As a Visitor, I want to immediately understand what Authesci does and why I should trust it, so that I feel confident creating an account.**

*   **Hero Section (Value-Centric):**
    *   **UI:** High-quality hero image (African scientists/research context) + Bold Headline + Subheadline.
    *   **Copy:** "Africa's Premier Research Hub: Connect, Collaborate, and Innovate."
    *   **CTAs:** Primary: "Join as Scientist" (High contrast). Secondary: "Post a Project" (Outline).
*   **Social Proof (Psychology):**
    *   **Feature:** "Live" Stats Bar immediately below the hero.
    *   **Data:** Display "500+ Active Researchers", "20+ New Projects", "Verified Institutions". *Note: Seed with realistic initial data if API returns < 10 to avoid "empty town" syndrome.*
*   **Trust Section (Verification):**
    *   **Feature:** "How Authesci Verification Works" visual step-by-step.
    *   **Content:** Explain the vetting process to reassure users that profiles are legitimate.
*   **Dynamic Job Feed (SEO Hook):**
    *   **Feature:** "Trending Opportunities" section.
    *   **Logic:** Fetch the top 6 "Popular" or "Newest" jobs from the database.
    *   **Interaction:** Clicking "Apply" redirects to Login/Signup.
    *   **SEO:** Render job titles and locations server-side for indexing.

### 3.2 About Page (The "Story")
**As a potential Partner or User, I want to know who is behind the platform, so that I can align with the mission.**

*   **Narrative:** Focus on "Bridging the gap in the African scientific landscape."
*   **Visuals:** Professional, clean, emphasizing connection and discovery.
*   **Content:** Mission statement, Vision, and the "Why" (solving visibility issues for African researchers).

### 3.3 Contact Page (The "Filter")
**As a User with a query, I want to reach the right support channel quickly.**

*   **Segmentation:**
    *   **Feature:** Subject Dropdown in the contact form.
    *   **Options:** "I am a Researcher", "I am an Institution/Employer", "Technical Support", "Partnership Inquiry".
*   **Routing:** Emails should be tagged with the segment for easier triage.

### 3.4 Legal Pages (The "Safety Net")
**As a cautious user, I want to know my data is safe and the terms are fair.**

*   **Privacy Policy:** Comprehensive policy covering data collection, usage (matching algorithms), and protection (GDPR/NDPR compliance context).
*   **Terms of Service:** Marketplace terms, code of conduct for collaboration, payment/escrow terms, and dispute resolution.

## 4. UX & Design Strategy
**Template Source:** `authesci-app/templates/freeio-html`
**Style Guide:** Distinct from Dashboard. Use the template's typography and spacing to feel like a "Modern Tech Landing Page" rather than a "SaaS App".

**Banner Management Strategy (Dynamic Iteration):**
*   **Concept:** Extract all unique banner/hero designs and navigation styles from the 20+ index files in `freeio-html`.
*   **Implementation:**
    *   Create a `BannerVariant` component that accepts a `variant` prop (e.g., `hero-v1`, `hero-v2`, `hero-search-focused`).
    *   Create a `NavbarVariant` component for different header styles.
    *   Store these variants in `components/modules/public/variants/`.
    *   **Benefit:** Allows A/B testing or seasonal updates by simply changing a prop or config value.

**Brand Assets:**
*   **Full Logo:** `authesci-app/public/assets/images/logo.png` (Use in Navbar/Footer)
*   **Icon Logo:** `authesci-app/public/assets/images/logo-icon.png` (Use for Favicon/Mobile/Social)

*   **Home:** Adapt `homepage-2.html` (or similar Value-Centric layout).
*   **About:** Adapt `about-us.html`.
*   **Contact:** Adapt `contact-us.html`.
*   **Legal:** Use a clean, text-focused layout (e.g., `transparent.html` or a simple container).

## 5. Technical Architecture

### 5.1 Route Structure (Multiple Root Layouts)
We will implement **Multiple Root Layouts** to completely isolate the Dashboard's heavy assets from the Public site's marketing assets. This ensures zero CSS conflicts and optimal performance.

**Old Structure:**
`app/layout.tsx` (Global) -> `app/(dashboard)` & `app/(public)`

**New Structure:**
```
app/
├── (app)/                  # NEW GROUP: Main Application (Dashboard + Auth)
│   ├── layout.tsx          # ROOT LAYOUT 1: Loads Dashboard CSS/JS, Auth Providers
│   ├── globals.css         # Dashboard-specific Tailwind/Shadcn
│   ├── (auth)/             # Login/Signup
│   └── (dashboard)/        # Main App Interface
│
└── (public)/               # EXISTING GROUP: Marketing Site
    ├── layout.tsx          # ROOT LAYOUT 2: Loads Marketing CSS/JS only
    ├── public.css          # Marketing-specific styles
    ├── page.tsx            # Home Page (Moved from app/page.tsx)
    ├── about/
    ├── contact/
    └── jobs/
```

**Migration Steps:**
1.  Create `app/(app)`.
2.  Move `app/layout.tsx`, `app/globals.css`, `app/(auth)`, `app/(dashboard)`, and other app logic into `app/(app)`.
3.  Ensure `app/(public)/layout.tsx` defines its own `<html>` and `<body>` tags.

### 5.2 Components
*   **PublicNavbar:** Sticky, transparent-to-solid on scroll. Links: Home, Jobs (Public Index), About, Login, Sign Up (Button).
*   **PublicFooter:** Dynamic year, links to Legal, Socials, Quick Links.
*   **JobCarousel:** Server Component fetching data from `prisma.job`.
*   **StatsCounter:** Client Component with counting animation.

### 5.3 SEO Implementation
*   **Metadata:** Use Next.js `generateMetadata` for dynamic titles/descriptions.
*   **Schema.org:** Implement `Organization` schema on Home and `JobPosting` schema on the public job feed.

## 6. Non-Functional & Technical Requirements

### 6.1 Social Previews (The "WhatsApp Factor")
*   **Requirement:** Links shared on social platforms (WhatsApp, LinkedIn, Twitter) must look premium.
*   **Implementation:**
    *   **Default OG Image:** A branded banner with the slogan "Africa's Premier Research Hub".
    *   **Dynamic OG Image:** For specific Job pages, generate images showing the Job Title and Location dynamically using `@vercel/og`.

### 6.2 Analytics & Conversion Tracking
*   **Requirement:** Track visitor behavior to measure the "Visitor-to-Signup" conversion rate.
*   **Implementation:**
    *   Integrate **Google Analytics 4** (GA4) via `next/third-parties`.
    *   Set up specific events for "Sign Up Button Click" and "Job Application Start".

### 6.3 Cookie Consent (Trust & Compliance)
*   **Requirement:** Comply with GDPR/NDPR by informing users about cookie usage.
*   **Implementation:**
    *   Display a simple, non-intrusive banner on the first visit.
    *   "We use cookies to improve your experience. [Accept] [Learn More]".

### 6.4 Custom 404 Page (The Safety Net)
*   **Requirement:** Prevent users from hitting a generic error page if they follow a broken link.
*   **Implementation:**
    *   Create `app/(public)/not-found.tsx`.
    *   Design: Friendly message, search bar, and button to return Home.

### 6.5 Performance Targets (Core Web Vitals)
*   **Requirement:** Ensure fast loading times for users on varying network speeds.
*   **Targets:**
    *   Lighthouse Performance Score > 90.
    *   First Contentful Paint (FCP) < 1.5s.
*   **Implementation:** Use `next/image` with `priority` for the Hero image. Optimize font loading.

## 7. Implementation Plan

### Phase 1: Setup & Layout (2 Hours)
*   [ ] **Migration:** Create `app/(app)` and move `layout.tsx`, `globals.css`, `(auth)`, `(dashboard)`, `api`, `actions` into it.
*   [ ] **Migration:** Move `app/page.tsx` to `app/(public)/page.tsx`.
*   [ ] **Migration:** Ensure `app/(app)/layout.tsx` and `app/(public)/layout.tsx` both have `<html>` and `<body>` tags (Root Layouts).
*   [ ] Implement `PublicLayout` with `PublicNavbar` and `PublicFooter`.
*   [ ] Migrate necessary CSS/Assets from `templates/front-page` to `public/front-assets/` to avoid conflicts.
*   [ ] **New:** Create `app/(public)/not-found.tsx`.

### Phase 2: Home Page (4 Hours)
*   [ ] Build Hero Section (Value Prop) with `priority` image loading.
*   [ ] Build Stats Component (with seed logic).
*   [ ] Build "Verification Explainer" section.
*   [ ] Build "Trending Jobs" section (Server Component fetching real DB data).
*   [ ] **New:** Implement Open Graph metadata for the homepage.

### Phase 3: Content Pages (3 Hours)
*   [ ] Build About Page (Static content from Brand Details).
*   [ ] Build Contact Page (Form with Zod validation + Email API integration).
*   [ ] Build Privacy & Terms Pages (Rich text content).

### Phase 4: Polish & Technical (2 Hours)
*   [ ] **New:** Integrate Google Analytics 4.
*   [ ] **New:** Add Cookie Consent Banner.
*   [ ] Add Metadata (OpenGraph images, descriptions) for all pages.
*   [ ] **SEO:** Create `app/sitemap.ts` (Dynamic generation for Jobs).
*   [ ] **SEO:** Create `app/robots.ts`.
*   [ ] **Fix:** Ensure Favicon is correctly linked in BOTH `app/(app)/layout.tsx` and `app/(public)/layout.tsx`.
*   [ ] Verify responsiveness on mobile.
*   [ ] Test Contact Form submission.
*   [ ] Audit performance (Lighthouse) and optimize images/fonts.

## 8. Risks & Dependencies
*   **CSS Conflicts:** The template CSS might clash with the Dashboard's Tailwind setup. *Mitigation: Scrutinize global styles. Use specific selectors for public pages or rely on Tailwind utility classes matching the template's design.*
*   **Empty Data:** "Trending Jobs" might look empty initially. *Mitigation: Fallback to "No active jobs" state or show placeholder "Example Jobs" until real data exists.*

## 9. MCP Tools & Resources
*   **`context7`:** Use to fetch SEO best practices for Next.js App Router if needed.
*   **`supabase`:** Use to verify public data fetching policies (RLS) for the Job Feed (ensure `anon` can read active jobs).
