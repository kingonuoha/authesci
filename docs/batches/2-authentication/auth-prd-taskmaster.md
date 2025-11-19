# Overview
Batch 2 implements a complete authentication system using Supabase Auth integrated with Prisma for profile management. Users can sign up with role selection, log in, verify email via OTP, reset passwords, and get redirected to role-specific dashboards.

**Problem It Solves:**
- No user authentication system exists
- Cannot distinguish between Scientists, Employers, and Collaborators
- No secure session management
- No profile data linked to authenticated users

**Who It's For:**
- All Authesci users (Scientists, Employers, Collaborators)
- Feature developers in Batches 3-10 (need auth context)

**Why It's Valuable:**
- Security: Supabase Auth provides industry-standard authentication
- Role-Based Access: Different user types see different interfaces
- Profile Integration: Auth users automatically get Prisma profiles
- Session Persistence: Users stay logged in across page refreshes
- Email Verification: Prevents fake accounts, improves security

**End Goal:** Users can create accounts, log in, verify email, reset passwords, and land on role-appropriate dashboards showing their role.

# Core Features

## Feature 1: Sign Up with Role Selection
**What it does:** Users can create accounts by providing name, email, password, institution, and selecting their role (Scientist/Employer).
**Why it's important:** First step in user journey, role determines entire app experience, creates both Supabase auth user and Prisma profile.
**How it works:** User fills sign-up form with role selector, Server Action creates Supabase auth user, Server Action creates Prisma profile with role, Supabase sends OTP verification email, User redirected to email verification page.
**Components:** `app/(auth)/signup/page.tsx`, `components/auth/SignUpForm.tsx`, `components/auth/RoleSelector.tsx`, `app/actions/auth.ts` (signUp()).
**Validation:** Email format, password strength (min 8 chars, 1 uppercase, 1 number, 1 special), full name required (min 2 chars), institution optional, role required (Scientist or Employer).

## Feature 2: Email Verification (OTP)
**What it does:** After signup, users receive OTP code via email to verify their account before accessing dashboard.
**Why it's important:** Prevents spam/fake accounts, confirms email ownership, required by Supabase Auth before full access.
**How it works:** Supabase automatically sends OTP email on signup, User enters 6-digit code on verification page, Server Action verifies OTP with Supabase, On success, user redirected to dashboard, On failure, show error with resend option.
**Components:** `app/(auth)/verify-email/page.tsx`, `components/auth/VerifyEmailForm.tsx`, `app/actions/auth.ts` (verifyOTP()).
**Email Configuration:** Supabase handles email sending automatically, custom email templates configured in Supabase dashboard, OTP expires after 1 hour.

## Feature 3: Login
**What it does:** Existing users can log in with email and password to access their dashboard.
**Why it's important:** Allows returning users to access accounts, validates credentials securely, establishes session for protected routes.
**How it works:** User enters email and password, Server Action authenticates with Supabase Auth, Supabase returns session token, Server sets session cookie, Fetch Prisma profile to get role, Redirect to role-specific dashboard.
**Components:** `app/(auth)/login/page.tsx`, `components/auth/LoginForm.tsx`, `app/actions/auth.ts` (login()).
**Features:** "Remember Me" checkbox, "Forgot Password" link, Email unverified warning (with resend link).

## Feature 4: Forgot Password
**What it does:** Users who forgot passwords can request reset link sent to email.
**Why it's important:** Account recovery without support intervention, common user need.
**How it works:** User enters email on forgot password page, Server Action triggers Supabase password reset, Supabase sends reset link via email, User clicks link, redirected to reset password page, User enters new password, Server Action updates password in Supabase.
**Components:** `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`, `components/auth/ForgotPasswordForm.tsx`, `components/auth/ResetPasswordForm.tsx`, `app/actions/auth.ts` (requestPasswordReset() and resetPassword()).
**Email Template:** Custom Supabase template with branded reset link, link expires after 1 hour.

## Feature 5: Route Protection (Middleware)
**What it does:** Prevents unauthenticated users from accessing protected routes (dashboard, profile, etc.).
**Why it's important:** Security: Dashboard data is user-specific, UX: Redirects to login instead of showing errors.
**How it works:** Middleware runs on every request to protected routes, Checks for valid Supabase session, If no session, redirect to /login, If session exists, allow request to continue, Refreshes session if expired.
**Implementation:** `middleware.ts`, `lib/supabase/middleware.ts`.
**Protected routes:** `/dashboard/*`, `/profile/*`, `/jobs/*/apply`, `/projects/*`.

## Feature 6: Session Management
**What it does:** Maintains user login state across page refreshes and browser sessions using secure cookies.
**Why it's important:** Users don't need to re-login constantly, session persists across tabs, automatic session refresh prevents expiration.
**How it works:** Supabase stores session in httpOnly cookies, SSR clients read cookies on server, Session auto-refreshes before expiration, Middleware refreshes session on each request.
**Components:** `lib/supabase/server.ts`, `lib/supabase/client.ts`, `middleware.ts`.
**Session Duration:** Default: 1 hour (with auto-refresh), "Remember Me": 30 days.

## Feature 7: Logout
**What it does:** Users can sign out, clearing session and redirecting to login page.
**Why it's important:** Security on shared devices, allows switching accounts.
**How it works:** User clicks logout button, Server Action calls Supabase signOut(), Clears session cookies, Redirects to login page.
**Components:** `components/dashboard/UserMenu.tsx`, `app/actions/auth.ts` (logout()).

## Feature 8: Role-Based Dashboard Redirect
**What it does:** After login, users are redirected to appropriate dashboard based on their role.
**Why it's important:** Scientists see job marketplace, Employers see applicant management, Provides role-specific experience immediately.
**How it works:** After successful login, fetch Prisma profile, Check profile.role field, Redirect based on role: SCIENTIST → /dashboard/scientist, EMPLOYER → /dashboard/employer, COLLABORATOR → /dashboard/collaborator, ADMIN → /dashboard/admin.
**Implementation:** In login Server Action after Supabase auth, Dashboard layout checks role and renders appropriate content.

## Feature 9: Email Integration (Hostinger SMTP)
**What it does:** Sends transactional emails (verification, password reset, welcome) via Hostinger SMTP using Nodemailer.
**Why it's important:** Supabase default emails may land in spam, branded emails improve trust, custom templates match Authesci design.
**How it works:** Configure Nodemailer with Hostinger SMTP credentials, Create email templates (HTML + text), Trigger emails from Server Actions, Supabase Auth hooks trigger custom emails.
**Implementation:** `app/api/mail/route.ts`, `lib/mail.ts`, `emails/` folder.
**Email Types:** Welcome Email, OTP Verification, Password Reset, Password Changed.

## Feature 10: Toast Notifications
**What it does:** Displays success/error messages for auth actions (login success, verification sent, password reset, etc.).
**Why it's important:** User feedback for async operations, error visibility without blocking UI, better UX than alert() dialogs.
**How it works:** Shadcn/UI toast provider in root layout, Server Actions return success/error messages, Client Components display toasts, Auto-dismiss after 5 seconds.
**Implementation:** `app/layout.tsx`, `components/ui/toast.tsx`, `lib/utils.ts`.
**Toast Types:** Success, Error, Info, Warning.

# User Experience

## User Personas
**Persona 1: New Scientist**
- **Goal:** Create account to apply for research jobs
- **Journey:** Visits homepage, clicks "Sign Up", Fills form, selects "Scientist" role, Receives OTP email, enters code, Lands on Scientist Dashboard showing profile completion prompt.

**Persona 2: Returning Employer**
- **Goal:** Log in to review job applications
- **Journey:** Visits login page, Enters credentials, clicks "Remember Me", Lands on Employer Dashboard showing applicant stats.

**Persona 3: Forgot Password User**
- **Goal:** Recover account access
- **Journey:** Clicks "Forgot Password" on login, Enters email, receives reset link, Clicks link, sets new password, Redirected to login, logs in successfully.

## Key User Flows
**Flow 1: Sign Up → Verification → Dashboard**
```
/signup
  → Fill form (name, email, password, role)
  → Submit
  → Supabase creates auth user
  → Prisma creates profile
  → Redirect to /verify-email
  → Enter OTP code
  → Verify
  → Redirect to /dashboard/[role]
  → Show "Welcome" message + profile completion prompt
```

**Flow 2: Login → Dashboard**
```
/login
  → Enter email + password
  → Submit
  → Supabase validates
  → Fetch Prisma profile
  → Redirect to /dashboard/[role]
  → Show last login time
```

**Flow 3: Forgot Password → Reset → Login**
```
/forgot-password
  → Enter email
  → Submit
  → Supabase sends reset email
  → Check inbox
  → Click reset link
  → Redirect to /reset-password?token=xxx
  → Enter new password
  → Submit
  → Redirect to /login
  → Login with new password
```

## UX Considerations
**Form Validation:** Real-time validation, clear error messages, success states.
**Loading States:** Button shows spinner, disable form inputs, skeleton placeholders.
**Error Handling:** Network errors, auth errors, email exists.
**Accessibility:** Form labels, error messages for screen readers, keyboard navigation, focus management.

# Technical Architecture

## System Components
```
Next.js App Router
├── Auth Pages (Server Components)
│   ├── /login
│   ├── /signup
│   ├── /verify-email
│   ├── /forgot-password
│   └── /reset-password
│
├── Auth Forms (Client Components)
│   ├── LoginForm
│   ├── SignUpForm
│   ├── VerifyEmailForm
│   ├── ForgotPasswordForm
│   └── ResetPasswordForm
│
├── Server Actions
│   ├── signUp()
│   ├── login()
│   ├── verifyOTP()
│   ├── logout()
│   ├── requestPasswordReset()
│   └── resetPassword()
│
├── Middleware
│   └── Route protection + session refresh
│
├── Supabase Auth
│   ├── User creation
│   ├── Session management
│   └── Email verification
│
├── Prisma
│   └── Profile creation + storage
│
└── Email Service (Hostinger SMTP)
    ├── Welcome emails
    ├── OTP emails
    └── Password reset emails
```

## Data Models
**Supabase `auth.users` (Managed by Supabase):** `id`, `email`, `encrypted_password`, `email_confirmed_at`, `last_sign_in_at`, `created_at`, `updated_at`.
**Prisma `profiles` (Application-managed):** `id`, `userId`, `email`, `fullName`, `role` (SCIENTIST | EMPLOYER | COLLABORATOR | ADMIN), `bio`, `skills`, `experience`, `cvUrl`, `avatarUrl`, `institution`, `createdAt`, `updatedAt`.
**Reference:** `/docs/context/database-schema.md` - Complete schema

## Authentication Flow
**Sign Up:** Client Form → Server Action (signUp) → Supabase.auth.signUp() → Prisma.profile.create() → redirect("/verify-email").
**Login:** Client Form → Server Action (login) → Supabase.auth.signInWithPassword() → Prisma.profile.findUnique() → redirect(`/dashboard/${role.toLowerCase()}`).
**Session Check (Middleware):** Every Request → Middleware → Supabase.auth.getSession() → If no session && protected route → redirect("/login") → If session → continue + refresh.

## APIs and Integrations
**Supabase Auth API:** `signUp`, `signInWithPassword`, `verifyOtp`, `resetPasswordForEmail`, `updateUser`, `signOut`.
**Prisma Profile API:** `prisma.profile.create`, `prisma.profile.findUnique`.
**Nodemailer (Email):** `nodemailer.createTransport`, `transporter.sendMail`.

## Infrastructure Requirements
**Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `NEXT_PUBLIC_APP_URL`.
**Supabase Configuration:** Auth providers: Email/Password enabled, Redirect URLs whitelisted.
**Prisma Migration:** `npx prisma migrate dev --name add-auth-profiles`.

# Development Roadmap

## Phase 1: Supabase Auth Setup (MVP)
**Goal:** Configure Supabase Auth and create basic auth utilities.
**Requirements:** Confirm `@supabase/ssr` installed, verify `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts` exist and work, enable Email/Password auth in Supabase dashboard, configure email redirect URLs in Supabase.
**Success Criteria:** Supabase Auth enabled, SSR clients can get session, Redirect URLs whitelisted.
**Deliverables:** Supabase Auth configured, SSR clients verified.
**Duration:** 1 hour.

## Phase 2: Prisma Profile Schema (MVP)
**Goal:** Ensure Profile model exists in Prisma schema with Role enum.
**Requirements:** Open `prisma/schema.prisma`, verify Profile model exists with all fields from `/docs/context/database-schema.md`, verify Role enum exists (SCIENTIST, EMPLOYER, COLLABORATOR, ADMIN), run `npx prisma migrate dev --name auth-profiles` if schema changed, run `npx prisma generate` to update types.
**Success Criteria:** Profile model matches schema doc, Role enum defined, Migration applied, TypeScript types updated.
**Deliverables:** Updated `prisma/schema.prisma`, Migration file created, Prisma Client regenerated.
**Duration:** 30 minutes.

## Phase 3: Sign Up Flow (MVP)
**Goal:** Users can create accounts with role selection.
**Requirements:** Create `app/(auth)/signup/page.tsx`, `components/auth/SignUpForm.tsx`, `components/auth/RoleSelector.tsx`, `app/actions/auth.ts` with `signUp()` Server Action, implement form validation, handle Supabase signup, create Prisma profile, redirect to `/verify-email`, add toast notifications.
**Success Criteria:** Form renders, validation works, Supabase user created, Prisma profile created, redirects to verification page, toast shows success.
**Deliverables:** `/signup` page, `SignUpForm` component, `RoleSelector` component, `signUp()` Server Action.
**Duration:** 3-4 hours.

## Phase 4: Email Verification (MVP)
**Goal:** Users verify email via OTP before accessing dashboard.
**Requirements:** Create `app/(auth)/verify-email/page.tsx`, `components/auth/VerifyEmailForm.tsx`, `app/actions/auth.ts` with `verifyOTP()` Server Action, handle OTP input, call Supabase `verifyOtp()`, redirect to dashboard on success, add "Resend Code", show countdown timer, add toast notifications.
**Success Criteria:** OTP input works, Supabase verifies code, success redirects, resend works, toast shows status.
**Deliverables:** `/verify-email` page, `VerifyEmailForm` component, `verifyOTP()` and `resendOTP()` Server Actions.
**Duration:** 2-3 hours.

## Phase 5: Login Flow (MVP)
**Goal:** Users can log in and reach role-based dashboard.
**Requirements:** Create `app/(auth)/login/page.tsx`, `components/auth/LoginForm.tsx`, `app/actions/auth.ts` with `login()` Server Action, implement email/password validation, call Supabase `signInWithPassword()`, fetch Prisma profile, redirect to `/dashboard/[role]`, add "Remember Me", "Forgot Password" link, handle unverified email, add toast notifications.
**Success Criteria:** Form validates, Supabase authenticates, fetches Prisma profile, redirects to correct dashboard, Remember Me extends session, toast shows status.
**Deliverables:** `/login` page, `LoginForm` component, `login()` Server Action.
**Duration:** 2-3 hours.

## Phase 6: Forgot/Reset Password (MVP)
**Goal:** Users can reset forgotten passwords via email.
**Requirements:** Create `app/(auth)/forgot-password/page.tsx`, `components/auth/ForgotPasswordForm.tsx`, `app/(auth)/reset-password/page.tsx`, `components/auth/ResetPasswordForm.tsx`, create `requestPasswordReset()` Server Action, create `resetPassword()` Server Action, call Supabase `resetPasswordForEmail()`, handle token, call Supabase `updateUser()`, redirect to login, add toast notifications.
**Success Criteria:** Forgot password sends email, reset link works, new password saves, user can log in, toast shows status.
**Deliverables:** `/forgot-password` page, `/reset-password` page, `ForgotPasswordForm`, `ResetPasswordForm`, `requestPasswordReset()`, `resetPassword()` Server Actions.
**Duration:** 2 hours.

## Phase 7: Route Protection (MVP)
**Goal:** Middleware protects dashboard routes from unauthenticated access.
**Requirements:** Create/update `middleware.ts`, use `lib/supabase/middleware.ts` client, check session, redirect to `/login` if no session, refresh session if expired, configure matcher.
**Protected Routes:** `/dashboard/*`, `/profile/*`, `/jobs/*/apply`, `/projects/*`.
**Success Criteria:** Unauthenticated users redirected, authenticated users access dashboard, session refreshes, no hydration errors.
**Deliverables:** `middleware.ts` with route protection, Matcher configuration.
**Duration:** 1-2 hours.

## Phase 8: Logout Functionality (MVP)
**Goal:** Users can sign out and clear session.
**Requirements:** Create `app/actions/auth.ts` with `logout()` Server Action, call Supabase `signOut()`, clear cookies, redirect to `/login`, add logout button to dashboard, add toast notification.
**Success Criteria:** Logout clears session, redirects to login, user cannot access dashboard, toast confirms logout.
**Deliverables:** `logout()` Server Action, Logout button in Navbar.
**Duration:** 1 hour.

## Phase 9: Email Integration (MVP)
**Goal:** Send custom branded emails via Hostinger SMTP.
**Requirements:** Install Nodemailer, install types, create `lib/mail.ts`, add SMTP credentials to `.env.local`, create `app/api/mail/route.ts`, create email templates in `emails/` folder, trigger emails from Server Actions, test email delivery.
**Success Criteria:** SMTP configured, emails send, emails arrive, templates render.
**Deliverables:** `lib/mail.ts` config, `app/api/mail/route.ts`, Email templates, SMTP credentials.
**Duration:** 2-3 hours.

## Phase 10: Toast Notifications (MVP)
**Goal:** Display user feedback for all auth actions.
**Requirements:** Verify Shadcn toast installed, add Toaster to `app/layout.tsx`, create toast helper in `lib/utils.ts`, add toasts to all auth actions.
**Success Criteria:** Toasts appear, auto-dismiss, different styles, accessible.
**Deliverables:** Toaster in root layout, Toast helper function, Toasts in all auth flows.
**Duration:** 1 hour.

## Phase 11: Role-Based Dashboard Redirect (MVP)
**Goal:** Users land on appropriate dashboard based on role.
**Requirements:** Create `app/dashboard/scientist/page.tsx` (placeholder), `app/dashboard/employer/page.tsx` (placeholder), `app/dashboard/collaborator/page.tsx` (placeholder), update login Server Action to redirect by role, show user's role, display welcome message, show profile completion prompt.
**Success Criteria:** Scientists → `/dashboard/scientist`, Employers → `/dashboard/employer`, Collaborators → `/dashboard/collaborator`, Dashboard shows correct role, welcome message.
**Deliverables:** Three dashboard pages (placeholders), Role-based redirect logic.
**Duration:** 1-2 hours.

## Phase 12: Testing & Polish (MVP)
**Goal:** Verify all auth flows work end-to-end.
**Test Scenarios:** Sign Up → Verify → Dashboard, Login → Dashboard, Forgot Password → Reset → Login, Unverified Email, Route Protection, Logout.
**Requirements:** Test all 6 scenarios manually, fix bugs, polish error messages, improve loading states, check mobile responsiveness, run accessibility audit.
**Success Criteria:** All test scenarios pass, no console errors, forms work on mobile, accessibility score ≥ 90.
**Deliverables:** All auth flows tested and working, bug fixes, documentation.

# Logical Dependency Chain
- Phase 1 (Supabase Auth Setup) and Phase 2 (Prisma Profile Schema) are foundational and should be completed first.
- Phase 3 (Sign Up Flow) depends on Phase 1 and 2.
- Phase 4 (Email Verification) depends on Phase 3.
- Phase 5 (Login Flow) depends on Phase 1, 2, and 3.
- Phase 6 (Forgot/Reset Password) depends on Phase 1 and 9 (for email sending).
- Phase 7 (Route Protection) depends on Phase 1 and 6.
- Phase 8 (Logout Functionality) depends on Phase 1.
- Phase 9 (Email Integration) can be developed in parallel but its full integration depends on other phases that trigger emails.
- Phase 10 (Toast Notifications) can be developed in parallel but its full integration depends on other phases that trigger toasts.
- Phase 11 (Role-Based Dashboard Redirect) depends on Phase 5 and the existence of dashboard pages.
- Phase 12 (Testing & Polish) depends on all previous phases being completed.

# Risks and Mitigations
- **Technical Challenges:** Supabase Auth integration complexities, Prisma schema conflicts. Mitigation: Thorough documentation review, incremental development, unit testing.
- **Figuring out the MVP that we can build upon:** Ensuring each phase delivers a functional, testable increment. Mitigation: Clear definition of "MVP" for each phase, frequent testing.
- **Resource Constraints:** Limited development time for each phase. Mitigation: Prioritize core features, defer non-essential enhancements.

# Appendix
- **Prerequisites:** Batch 1 Complete (Prisma configured, SSR clients ready), Batch 1.5 Complete (Component library).
- **Duration Estimate:** 2 days (12-16 hours).
