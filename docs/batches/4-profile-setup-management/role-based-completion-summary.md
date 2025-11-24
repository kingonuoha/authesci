# Profile Completion & Role-Based Fields - Update Summary

## Overview
Updated the profile completion system to be role-specific and redesigned the ProfileCompletionCard with a premium template-inspired design.

## Changes Made

### 1. Role-Specific Profile Requirements (`lib/helpers/getProfileCompletion.ts`)
**Status:** ✅ Updated

#### Updated Required Fields by Role:
- **SCIENTIST**: 
  - Common: Full Name, Bio, Profile Picture, Skills
  - Role-specific: Institution, Experience, **CV/Resume** (required)
  - Optional: Publications (not required for completion)
  
- **EMPLOYER**:
  - Common: Full Name, Bio, Profile Picture, Skills
  - Role-specific: Institution
  - **No CV required** ✅
  
- **COLLABORATOR**:
  - Common fields only: Full Name, Bio, Profile Picture, Skills
  - Minimal requirements
  
- **ADMIN**:
  - Common fields only: Full Name, Bio, Profile Picture, Skills

### 2. ProfileCompletionCard Component (`components/modules/profile/ProfileCompletionCard.tsx`)
**Status:** ✅ Redesigned

#### New Features:
- **Template-inspired design** matching WowDash widgets
- **Dynamic color scheme** based on completion percentage:
  - 80%+: Success green (verified)
  - 50-79%: Warning orange
  - <50%: Primary blue
- **Circular icon** with UserCheck icon
- **Progress bar** with smooth transitions
- **Status messages**:
  - ≥80%: "Great! Your profile is verified and complete."
  - <80%: "Complete your profile to unlock all features"
- **Missing fields list** (shows up to 3, with count for more)
- **Action button** with role-specific link
- **Gradient background** matching template style

#### Props:
```typescript
interface ProfileCompletionCardProps {
  percentage: number;
  missingFields: string[];
  role: string; // NEW - for role-specific routing
}
```

### 3. ProfileEditForm Component (`app/profile/ProfileEditForm.tsx`)
**Status:** ✅ Updated

#### Conditional CV Upload:
- CV upload section now **only displays for**:
  - SCIENTIST role
  - ADMIN role
- **Hidden for**:
  - EMPLOYER role ✅
  - COLLABORATOR role ✅

```tsx
{/* CV Upload - Only for Scientists and Admins */}
{(profile.role === "SCIENTIST" || profile.role === "ADMIN") && (
  <div className="col-span-12">
    <label>CV / Resume</label>
    <FileUploader ... />
  </div>
)}
```

### 4. Dashboard Integration
**Status:** ✅ Updated

#### Scientist Dashboard (`app/scientist/dashboard/page.tsx`):
```tsx
<ProfileCompletionCard 
  percentage={percentage} 
  missingFields={missingFields} 
  role={profile.role} // Added
/>
```

#### Employer Dashboard (`app/employer/dashboard/page.tsx`):
```tsx
<ProfileCompletionCard 
  percentage={percentage} 
  missingFields={missingFields} 
  role={profile.role} // Added
/>
```

## Visual Design

### ProfileCompletionCard Layout:
```
┌─────────────────────────────────────┐
│ [Icon] Profile Completion           │
│        80%                           │
│                                      │
│ ████████████████░░░░ 80%            │
│                                      │
│ ✓ Great! Your profile is verified   │
│                                      │
│ Missing items:                       │
│ • Institution                        │
│ • Experience                         │
│                                      │
│ [Complete Profile →]                 │
└─────────────────────────────────────┘
```

### Color Schemes:
- **Success (80%+)**: Green gradient, green icon, green button
- **Warning (50-79%)**: Orange gradient, orange icon, orange button
- **Primary (<50%)**: Blue gradient, blue icon, blue button

## Template Classes Used

### Card Container:
```css
card shadow-none border border-gray-200 dark:border-neutral-600 
dark:bg-neutral-700 rounded-lg h-full 
bg-gradient-to-l from-{color}-600/10 to-bg-white
```

### Icon Circle:
```css
w-[50px] h-[50px] bg-{color}-600 
shrink-0 text-white flex justify-center items-center rounded-full
```

### Progress Bar:
```css
/* Container */
w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2.5

/* Fill */
h-2.5 rounded-full transition-all duration-300 bg-{color}-600
```

### Action Button:
```css
w-full inline-flex items-center justify-center gap-2 
px-4 py-2.5 rounded-lg font-medium text-sm transition-colors 
bg-{color}-600 hover:opacity-90 text-white
```

## Role-Based Behavior Summary

| Role         | CV Required | Publications | Experience | Institution |
|--------------|-------------|--------------|------------|-------------|
| SCIENTIST    | ✅ Yes      | Optional     | Required   | Required    |
| EMPLOYER     | ❌ No       | N/A          | No         | Required    |
| COLLABORATOR | ❌ No       | N/A          | No         | No          |
| ADMIN        | ✅ Yes      | Optional     | No         | No          |

## Benefits

### 1. **Role-Appropriate Requirements**
- Employers don't need to upload CVs (they hire, not apply)
- Scientists have CV as a requirement (needed for job applications)
- Collaborators have minimal requirements

### 2. **Better UX**
- Users only see relevant fields for their role
- Clear visual feedback on completion status
- Dynamic color coding for quick status recognition
- Actionable missing items list

### 3. **Template Consistency**
- Matches WowDash widget design language
- Consistent with other dashboard cards
- Professional, premium appearance

### 4. **Smart Routing**
- Button links to role-specific profile page
- `/scientist/profile` for scientists
- `/employer/profile` for employers

## Testing Checklist

- [ ] Scientist sees CV upload field in profile edit
- [ ] Employer does NOT see CV upload field
- [ ] Profile completion card shows correct percentage
- [ ] Card color changes based on completion (blue → orange → green)
- [ ] Missing fields list displays correctly
- [ ] "Complete Profile" button links to correct role page
- [ ] Card hides when profile is 100% complete
- [ ] Verified badge appears at 80%+ completion
- [ ] Dark mode styling works correctly

## Files Modified

1. ✅ `lib/helpers/getProfileCompletion.ts` - Role-specific requirements
2. ✅ `components/modules/profile/ProfileCompletionCard.tsx` - Redesigned card
3. ✅ `app/profile/ProfileEditForm.tsx` - Conditional CV upload
4. ✅ `app/scientist/dashboard/page.tsx` - Added role prop
5. ✅ `app/employer/dashboard/page.tsx` - Added role prop

---

**Status**: ✅ Complete and ready for testing
