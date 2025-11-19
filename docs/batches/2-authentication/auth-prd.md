🔐 Batch 2: Authentication & Session Management - PRD
Batch ID: 2
Version: 1.0
Last Updated: 2025-11-10
Status: Ready to Start
Prerequisites: Batch 1 Complete (Prisma configured, SSR clients ready), Batch 1.5 Complete (Component library)
Duration Estimate: 2 days (12-16 hours)

Overview
Batch 2 implements a complete authentication system using Supabase Auth integrated with Prisma for profile management. Users can sign up with role selection, log in, verify email via OTP, reset passwords, and get redirected to role-specific dashboards.
Problem It Solves:

No user authentication system exists
Cannot distinguish between Scientists, Employers, and Collaborators
No secure session management
No profile data linked to authenticated users

Who It's For:

All Authesci users (Scientists, Employers, Collaborators)
Feature developers in Batches 3-10 (need auth context)

Why It's Valuable:

Security: Supabase Auth provides industry-standard authentication
Role-Based Access: Different user types see different interfaces
Profile Integration: Auth users automatically get Prisma profiles
Session Persistence: Users stay logged in across page refreshes
Email Verification: Prevents fake accounts, improves security

End Goal: Users can create accounts, log in, verify email, reset passwords, and land on role-appropriate dashboards showing their role.

Core Features
Feature 1: Sign Up with Role Selection
What it does:
Users can create accounts by providing name, email, password, institution, and selecting their role (Scientist/Employer).
Why it's important:

First step in user journey
Role determines entire app experience (dashboard, features)
Creates both Supabase auth user and Prisma profile

How it works:

User fills sign-up form with role selector
Server Action creates Supabase auth user
Server Action creates Prisma profile with role
Supabase sends OTP verification email
User redirected to email verification page

Components:

app/(auth)/signup/page.tsx - Server Component wrapper
components/auth/SignUpForm.tsx - Client Component form
components/auth/RoleSelector.tsx - Client Component role picker
app/actions/auth.ts - Server Action signUp()

Validation:

Email format validation
Password strength (min 8 chars, 1 uppercase, 1 number, 1 special)
Full name required (min 2 chars)
Institution optional
Role required (Scientist or Employer)


Feature 2: Email Verification (OTP)
What it does:
After signup, users receive OTP code via email to verify their account before accessing dashboard.
Why it's important:

Prevents spam/fake accounts
Confirms email ownership
Required by Supabase Auth before full access

How it works:

Supabase automatically sends OTP email on signup
User enters 6-digit code on verification page
Server Action verifies OTP with Supabase
On success, user redirected to dashboard
On failure, show error with resend option

Components:

app/(auth)/verify-email/page.tsx - Server Component wrapper
components/auth/VerifyEmailForm.tsx - Client Component OTP input
app/actions/auth.ts - Server Action verifyOTP()

Email Configuration:

Supabase handles email sending automatically
Custom email templates configured in Supabase dashboard
OTP expires after 1 hour


Feature 3: Login
What it does:
Existing users can log in with email and password to access their dashboard.
Why it's important:

Allows returning users to access accounts
Validates credentials securely
Establishes session for protected routes

How it works:

User enters email and password
Server Action authenticates with Supabase Auth
Supabase returns session token
Server sets session cookie
Fetch Prisma profile to get role
Redirect to role-specific dashboard

Components:

app/(auth)/login/page.tsx - Server Component wrapper
components/auth/LoginForm.tsx - Client Component form
app/actions/auth.ts - Server Action login()

Features:

"Remember Me" checkbox (extends session)
"Forgot Password" link
Email unverified warning (with resend link)


Feature 4: Forgot Password
What it does:
Users who forgot passwords can request reset link sent to email.
Why it's important:

Account recovery without support intervention
Common user need

How it works:

User enters email on forgot password page
Server Action triggers Supabase password reset
Supabase sends reset link via email
User clicks link, redirected to reset password page
User enters new password
Server Action updates password in Supabase

Components:

app/(auth)/forgot-password/page.tsx - Request reset page
app/(auth)/reset-password/page.tsx - Set new password page
components/auth/ForgotPasswordForm.tsx - Client Component
components/auth/ResetPasswordForm.tsx - Client Component
app/actions/auth.ts - Server Actions requestPasswordReset() and resetPassword()

Email Template:

Custom Supabase template with branded reset link
Link expires after 1 hour


Feature 5: Route Protection (Middleware)
What it does:
Prevents unauthenticated users from accessing protected routes (dashboard, profile, etc.).
Why it's important:

Security: Dashboard data is user-specific
UX: Redirects to login instead of showing errors

How it works:

Middleware runs on every request to protected routes
Checks for valid Supabase session
If no session, redirect to /login
If session exists, allow request to continue
Refreshes session if expired

Implementation:

middleware.ts - Route protection logic
lib/supabase/middleware.ts - SSR client for middleware
Protected routes: /dashboard/*, /profile/*, /jobs/*/apply, /projects/*

Configuration:
typescriptexport const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/jobs/:path*/apply",
    "/projects/:path*"
  ]
}

Feature 6: Session Management
What it does:
Maintains user login state across page refreshes and browser sessions using secure cookies.
Why it's important:

Users don't need to re-login constantly
Session persists across tabs
Automatic session refresh prevents expiration

How it works:

Supabase stores session in httpOnly cookies
SSR clients read cookies on server
Session auto-refreshes before expiration
Middleware refreshes session on each request

Components:

lib/supabase/server.ts - Server Component session access
lib/supabase/client.ts - Client Component session access
middleware.ts - Session refresh logic

Session Duration:

Default: 1 hour (with auto-refresh)
"Remember Me": 30 days


Feature 7: Logout
What it does:
Users can sign out, clearing session and redirecting to login page.
Why it's important:

Security on shared devices
Allows switching accounts

How it works:

User clicks logout button
Server Action calls Supabase signOut()
Clears session cookies
Redirects to login page

Components:

components/dashboard/UserMenu.tsx - Client Component with logout button
app/actions/auth.ts - Server Action logout()


Feature 8: Role-Based Dashboard Redirect
What it does:
After login, users are redirected to appropriate dashboard based on their role.
Why it's important:

Scientists see job marketplace
Employers see applicant management
Provides role-specific experience immediately

How it works:

After successful login, fetch Prisma profile
Check profile.role field
Redirect based on role:

SCIENTIST → /dashboard/scientist
EMPLOYER → /dashboard/employer
COLLABORATOR → /dashboard/collaborator
ADMIN → /dashboard/admin



Implementation:

In login Server Action after Supabase auth
Dashboard layout checks role and renders appropriate content


Feature 9: Email Integration (Hostinger SMTP)
What it does:
Sends transactional emails (verification, password reset, welcome) via Hostinger SMTP using Nodemailer.
Why it's important:

Supabase default emails may land in spam
Branded emails improve trust
Custom templates match Authesci design

How it works:

Configure Nodemailer with Hostinger SMTP credentials
Create email templates (HTML + text)
Trigger emails from Server Actions
Supabase Auth hooks trigger custom emails

Implementation:

app/api/mail/route.ts - Email sending API route
lib/mail.ts - Nodemailer configuration
emails/ - Email templates (HTML)

Email Types:

Welcome Email: After signup verification
OTP Verification: Contains 6-digit code
Password Reset: Contains reset link
Password Changed: Confirmation after reset

SMTP Configuration:
typescript{
  host: process.env.SMTP_HOST, // Hostinger SMTP server
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}
```

---

### Feature 10: Toast Notifications

**What it does:**
Displays success/error messages for auth actions (login success, verification sent, password reset, etc.).

**Why it's important:**
- User feedback for async operations
- Error visibility without blocking UI
- Better UX than alert() dialogs

**How it works:**
1. Shadcn/UI toast provider in root layout
2. Server Actions return success/error messages
3. Client Components display toasts
4. Auto-dismiss after 5 seconds

**Implementation:**
- `app/layout.tsx` - Toast provider wrapper
- `components/ui/toast.tsx` - Shadcn toast component
- `lib/utils.ts` - Toast helper functions

**Toast Types:**
- Success: "Account created successfully"
- Error: "Invalid email or password"
- Info: "Verification email sent"
- Warning: "Please verify your email before logging in"

---

## User Experience

### User Personas

**Persona 1: New Scientist**
- **Goal:** Create account to apply for research jobs
- **Journey:**
  1. Visits homepage, clicks "Sign Up"
  2. Fills form, selects "Scientist" role
  3. Receives OTP email, enters code
  4. Lands on Scientist Dashboard showing profile completion prompt

**Persona 2: Returning Employer**
- **Goal:** Log in to review job applications
- **Journey:**
  1. Visits login page
  2. Enters credentials, clicks "Remember Me"
  3. Lands on Employer Dashboard showing applicant stats

**Persona 3: Forgot Password User**
- **Goal:** Recover account access
- **Journey:**
  1. Clicks "Forgot Password" on login
  2. Enters email, receives reset link
  3. Clicks link, sets new password
  4. Redirected to login, logs in successfully

---

### Key User Flows

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

---

### UX Considerations

**Form Validation:**
- Real-time validation (show errors on blur, not on every keystroke)
- Clear error messages ("Password must be at least 8 characters")
- Success states (green checkmarks)

**Loading States:**
- Button shows spinner during submission
- Disable form inputs while loading
- Skeleton placeholders for async data

**Error Handling:**
- Network errors: "Connection failed. Please try again."
- Auth errors: "Invalid email or password"
- Email exists: "Account already exists. Try logging in."

**Accessibility:**
- Form labels associated with inputs
- Error messages announced to screen readers
- Keyboard navigation works
- Focus management (auto-focus first input)

---

## Technical Architecture

### System Components
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

---

### Data Models

**Supabase `auth.users` (Managed by Supabase):**
- `id` (uuid) - User ID
- `email` (text) - Email address
- `encrypted_password` (text) - Hashed password
- `email_confirmed_at` (timestamp) - Verification time
- `last_sign_in_at` (timestamp) - Last login
- `created_at`, `updated_at`

**Prisma `profiles` (Application-managed):**
- `id` (uuid) - Profile ID
- `userId` (uuid, unique) - FK to Supabase auth.users.id
- `email` (text, unique) - Synced from auth.users
- `fullName` (text) - User's display name
- `role` (enum) - SCIENTIST | EMPLOYER | COLLABORATOR | ADMIN
- `bio`, `skills`, `experience`, `cvUrl`, `avatarUrl`, `institution` (optional)
- `createdAt`, `updatedAt`

**Reference:** `/docs/context/database-schema.md` - Complete schema

---

### Authentication Flow

**Sign Up:**
```
Client Form
  → Server Action (signUp)
    → Supabase.auth.signUp({ email, password })
    → Prisma.profile.create({ userId, email, fullName, role })
    → redirect("/verify-email")
```

**Login:**
```
Client Form
  → Server Action (login)
    → Supabase.auth.signInWithPassword({ email, password })
    → Prisma.profile.findUnique({ where: { userId } })
    → redirect(`/dashboard/${role.toLowerCase()}`)
```

**Session Check (Middleware):**
```
Every Request
  → Middleware
    → Supabase.auth.getSession()
    → If no session && protected route → redirect("/login")
    → If session → continue + refresh

APIs and Integrations
Supabase Auth API:
typescript// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/auth/callback`,
    data: { full_name: fullName }
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  email,
  token,
  type: 'email'
})

// Password reset request
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset-password`
})

// Update password
const { data, error } = await supabase.auth.updateUser({
  password: newPassword
})

// Sign out
const { error } = await supabase.auth.signOut()
Prisma Profile API:
typescript// Create profile
const profile = await prisma.profile.create({
  data: {
    userId: supabaseUser.id,
    email: supabaseUser.email,
    fullName,
    role
  }
})

// Get profile
const profile = await prisma.profile.findUnique({
  where: { userId }
})
Nodemailer (Email):
typescriptconst transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

await transporter.sendMail({
  from: '"Authesci" <noreply@authesci.com>',
  to: email,
  subject: "Welcome to Authesci",
  html: welcomeEmailTemplate
})

Infrastructure Requirements
Environment Variables:
bash# .env.local

# Supabase (already configured in Batch 1)
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"

# Hostinger SMTP
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=587
SMTP_USER="noreply@authesci.com"
SMTP_PASSWORD="[smtp-password]"

# App URL (for email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Dev
# NEXT_PUBLIC_APP_URL="https://authesci.com" # Production
Supabase Configuration:

Auth providers: Email/Password enabled
Email templates customized (optional, can use default)
Redirect URLs whitelisted: http://localhost:3000/auth/callback, https://authesci.com/auth/callback

Prisma Migration:
bash# Ensure profiles table exists
npx prisma migrate dev --name add-auth-profiles

Development Roadmap
Phase 1: Supabase Auth Setup (MVP)
Goal: Configure Supabase Auth and create basic auth utilities
Requirements:

 Confirm @supabase/ssr installed
 Verify lib/supabase/server.ts exists and works
 Verify lib/supabase/client.ts exists and works
 Verify lib/supabase/middleware.ts exists and works
 Enable Email/Password auth in Supabase dashboard
 Configure email redirect URLs in Supabase

Success Criteria:

Supabase Auth enabled in dashboard
SSR clients can get session without errors
Redirect URLs whitelisted

Deliverables:

Supabase Auth configured
SSR clients verified

Duration: 1 hour

Phase 2: Prisma Profile Schema (MVP)
Goal: Ensure Profile model exists in Prisma schema with Role enum
Requirements:

 Open prisma/schema.prisma
 Verify Profile model exists with all fields from /docs/context/database-schema.md
 Verify Role enum exists (SCIENTIST, EMPLOYER, COLLABORATOR, ADMIN)
 Run npx prisma migrate dev --name auth-profiles if schema changed
 Run npx prisma generate to update types

Success Criteria:

Profile model matches schema doc
Role enum defined
Migration applied successfully
TypeScript types updated

Deliverables:

Updated prisma/schema.prisma
Migration file created
Prisma Client regenerated

Duration: 30 minutes

Phase 3: Sign Up Flow (MVP)
Goal: Users can create accounts with role selection
Requirements:

 Create app/(auth)/signup/page.tsx (Server Component)
 Create components/auth/SignUpForm.tsx (Client Component)
 Create components/auth/RoleSelector.tsx (Client Component)
 Create app/actions/auth.ts with signUp() Server Action
 Implement form validation (email format, password strength)
 Handle Supabase signup
 Create Prisma profile after Supabase user created
 Redirect to /verify-email after signup
 Add toast notifications for success/errors

Success Criteria:

Form renders correctly
Validation works (email, password, name, role)
Supabase user created
Prisma profile created with correct role
Redirects to verification page
Toast shows success message

Deliverables:

/signup page
SignUpForm component
RoleSelector component
signUp() Server Action

Duration: 3-4 hours

Phase 4: Email Verification (MVP)
Goal: Users verify email via OTP before accessing dashboard
Requirements:

 Create app/(auth)/verify-email/page.tsx
 Create components/auth/VerifyEmailForm.tsx (Client Component)
 Create app/actions/auth.ts with verifyOTP() Server Action
 Handle OTP input (6-digit code)
 Call Supabase verifyOtp() API
 Redirect to dashboard on success
 Add "Resend Code" functionality
 Show countdown timer for resend (60 seconds)
 Add toast notifications

Success Criteria:

OTP input works (6 digits)
Supabase verifies code correctly
Success redirects to dashboard
Resend works after timeout
Toast shows verification status

Deliverables:

/verify-email page
VerifyEmailForm component
verifyOTP() and resendOTP() Server Actions

Duration: 2-3 hours

Phase 5: Login Flow (MVP)
Goal: Users can log in and reach role-based dashboard
Requirements:

 Create app/(auth)/login/page.tsx
 Create components/auth/LoginForm.tsx (Client Component)
 Create app/actions/auth.ts with login() Server Action
 Implement email/password validation
 Call Supabase signInWithPassword()
 Fetch Prisma profile to get role
 Redirect to /dashboard/[role] based on role
 Add "Remember Me" checkbox (extends session)
 Add "Forgot Password" link
 Handle unverified email error (show resend link)
 Add toast notifications

Success Criteria:

Form validates email/password
Supabase authenticates correctly
Fetches Prisma profile
Redirects to correct dashboard based on role
Remember Me extends session duration
Toast shows login status

Deliverables:

/login page
LoginForm component
login() Server Action

Duration: 2-3 hours

Phase 6: Forgot/Reset Password (MVP)
Goal: Users can reset forgotten passwords via email
Requirements:

 Create app/(auth)/forgot-password/page.tsx
 Create components/auth/ForgotPasswordForm.tsx
 Create app/(auth)/reset-password/page.tsx
 Create components/auth/ResetPasswordForm.tsx
 Create requestPasswordReset() Server Action
 Create resetPassword() Server Action
 Call Supabase resetPasswordForEmail()
 Handle password reset token from URL
 Call Supabase updateUser() with new password
 Redirect to login after successful reset
 Add toast notifications

Success Criteria:

Forgot password sends email
Reset link works
New password saves to Supabase
User can log in with new password
Toast shows reset status

Deliverables:

/forgot-password page
/reset-password page
ForgotPasswordForm and ResetPasswordForm components
requestPasswordReset() and resetPassword() Server Actions

Duration: 2 hours

Phase 7: Route Protection (MVP)
Goal: Middleware protects dashboard routes from unauthenticated access
Requirements:

 Create/update middleware.ts in root
 Use lib/supabase/middleware.ts client
 Check session on protected routes
 Redirect to /login if no session
 Refresh session if expired
 Configure matcher for protected routes

Protected Routes:

/dashboard/*
/profile/*
/jobs/*/apply
/projects/*

Success Criteria:

Unauthenticated users redirected to login
Authenticated users can access dashboard
Session refreshes automatically
No hydration errors

Deliverables:

middleware.ts with route protection
Matcher configuration

Duration: 1-2 hours

Phase 8: Logout Functionality (MVP)
Goal: Users can sign out and clear session
Requirements:

 Create app/actions/auth.ts with logout() Server Action
 Call Supabase signOut()
 Clear cookies
 Redirect to /login
 Add logout button to dashboard (will be in Navbar from Batch 1.5)
 Add toast notification

Success Criteria:

Logout clears session
Redirects to login
User cannot access dashboard after logout
Toast confirms logout

Deliverables:

logout() Server Action
Logout button in Navbar (update Batch 1.5 component)

Duration: 1 hour

Phase 9: Email Integration (MVP)
Goal: Send custom branded emails via Hostinger SMTP
Requirements:

 Install Nodemailer: npm install nodemailer
 Install types: npm install -D @types/nodemailer
 Create lib/mail.ts with transporter configuration
 Add SMTP credentials to .env.local
 Create app/api/mail/route.ts API route
 Create email templates in emails/ folder:

welcome.html - Welcome email after verification
otp.html - OTP verification email
password-reset.html - Password reset link
password-changed.html - Confirmation after reset


 Trigger emails from Server Actions
 Test email delivery

Success Criteria:

SMTP configured correctly
Emails send without errors
Emails arrive in inbox (not spam)
Email templates render correctly

Deliverables:

lib/mail.ts configuration
app/api/mail/route.ts API route
Email templates in emails/
SMTP credentials in .env.local

Duration: 2-3 hours

Phase 10: Toast Notifications (MVP)
Goal: Display user feedback for all auth actions
Requirements:

 Verify Shadcn toast installed: npx shadcn-ui@latest add toast
 Add Toaster to app/layout.tsx
 Create toast helper in lib/utils.ts
 Add toasts to all auth actions:

Sign up success
Verification sent
Login success/error
Password reset sent
Password changed
Logout



Success Criteria:

Toasts appear for all actions
Auto-dismiss after 5 seconds
Different styles for success/error/info
Accessible to screen readers

Deliverables:

Toaster in root layout
Toast helper function
Toasts in all auth flows

Duration: 1 hour

Phase 11: Role-Based Dashboard Redirect (MVP)
Goal: Users land on appropriate dashboard based on role
Requirements:

 Create app/dashboard/scientist/page.tsx (placeholder)
 Create app/dashboard/employer/page.tsx (placeholder)
 Create app/dashboard/collaborator/page.tsx (placeholder)
 Update login Server Action to redirect by role
 Show user's role on dashboard
 Display welcome message with user's name
 Show profile completion prompt (if incomplete)

Success Criteria:

Scientists → /dashboard/scientist
Employers → /dashboard/employer
Collaborators → /dashboard/collaborator
Dashboard shows correct role
Welcome message displays

Deliverables:

Three dashboard pages (placeholders)
Role-based redirect logic in login

Duration: 1-2 hours

Phase 12: Testing & Polish (MVP)
Goal: Verify all auth flows work end-to-end
Test Scenarios:

Sign Up → Verify → Dashboard:

Create account as Scientist
Verify email with OTP
Land on Scientist dashboard


Login → Dashboard:

Log in with existing account
Land on correct dashboard


Forgot Password → Reset → Login:

Request password reset
Click email link
Set new password
Log in with new password


Unverified Email:

Try to login without verifying
See error message
Resend verification
Verify and login


Route Protection:

Try to access /dashboard without login
Get redirected to /login


Logout:

Log in
Click logout
Cannot access dashboard



Requirements:

 Test all 6 scenarios manually
 Fix any bugs found
 Polish error messages
 Improve loading states
 Check mobile responsiveness
 Run accessibility audit

Success Criteria:

All test scenarios pass
No console errors
Forms work on mobile
Accessibility score ≥ 90 (Lighthouse)

Deliverables:

All auth flows tested and working
Bug fixes applied
Documentation of any issues