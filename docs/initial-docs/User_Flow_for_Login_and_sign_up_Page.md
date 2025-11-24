# User Flow for Login Page

## 1. Entry Point
* User clicks **Get started** from homepage or another page.
* Lands on **Login Page**:
    * **Heading:** Welcome Back
    * **Subtext:** Sign in to continue your research journey

## 2. Input Fields
* Email Address
* Password
* **Option:** Remember me (keeps them signed in next time).

## 3. Possible Paths

### Path A – Successful Login
* User enters valid credentials.
* Clicks **Login**.
* System authenticates → Redirects to **Dashboard/Home screen**.

### Path B – Incorrect Login
* User enters invalid credentials.
* System displays **error message**: “Invalid email or password.”
* Prompts retry OR use “Forgot password?” link.

### Path C – Forgot Password
* User clicks **Forgot Password?**
* Redirects to **Password Recovery Page**:
    * Enter email → Receive reset link.
    * Set new password → Redirect back to Login Page.
    * Successful reset → User logs in.

### Path D – New User
* User clicks **Create an Account** under **New to Authesci?**
* Redirects to **Sign Up Page**.

---

# User Flow for Signup Page

## 1. Entry Point
* User clicks **Get started** (from homepage) or **Create an Account** (from Login page).
* Lands on **Signup Page**:
    * **Heading:** Join Authesci – Create your Account

## 2. Input Fields
**User fills out:**
* Full Name
* Email Address
* Password
* Institution
* **Role** (e.g., Researcher, Student, Industry Scientist, etc.)
    * *Role options:* Graduate student, Postdoc, Research Scientist, Principal Investigator, Lab Manager, Industry Researcher, Other.
* **Checkbox:**
    * ✅ I agree to the Terms of Service and Privacy Policy

## 3. Possible Paths

### Path A – Successful Signup
* User enters valid info + checks the agreement box.
* Clicks **Sign Up**.
* System validates details → Account created.
* Lands on **Personalized Profile & Dashboard**.

### Path B – Validation Errors
* Missing required fields → show inline error (e.g., “Email is required”).
* Weak password → show prompt (e.g., “Password must be 8+ characters”).
* Checkbox not ticked → prevent submission until accepted.

### Path C – Existing Account
* User realizes they already have an account.
* Clicks **Sign In Instead**.
* Redirects to **Login Page**.

---

## UI Text Details

### Login Page Elements
* **Welcome Back**
* Sign in to continue your research journey
* Enter your email
* Enter your password
* **Sign In**
* New to Authesci? **Create an Account**

### Signup Page Elements
* **Join Authesci**
* Create your Account
* Enter your full name
* Enter your email
* Create a password
* Your university or organization
* Select your role
* I agree to the Terms of service and Privacy policy
* **Create Account**
* Already have an account? **Sign In Instead**