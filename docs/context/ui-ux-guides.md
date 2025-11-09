# 🎨 Authesci UI/UX Guidelines

**Version:** 1.0  
**Last Updated:** 2024-11-06  
**Purpose:** Design principles, component standards, and accessibility requirements for Authesci frontend.

---

## 🎯 Core Design Principles

1. **Consistency First** - Reuse components from `@/components/modules` and `@/components/ui` (Shadcn)
2. **Accessibility (WCAG 2.1 AA)** - Semantic HTML, keyboard navigation, screen reader support, 4.5:1 color contrast
3. **Performance** - Server Components by default, Next.js `<Image>` and `<Link>`, lazy loading
4. **Mobile-First Responsive** - Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

---

## 🧩 Component Usage Strategy

### When to Create Custom Component
- Pattern appears 3+ times across features
- Specific to Authesci domain (e.g., `JobCard`, `ProjectCard`)
- Needs custom business logic

**Location:** `components/modules/[domain]/ComponentName.tsx`

### When to Use Shadcn/UI
- Common UI primitives: buttons, inputs, cards, dialogs
- Form elements: select, checkbox, radio
- Overlays: dropdowns, popovers, tooltips
- Feedback: toasts, alerts

**Installation:** `npx shadcn-ui@latest add [component-name]`  
**Reference:** https://ui.shadcn.com/docs/components

### When to Adapt from WowDash Template
- Building complex layouts (dashboards, multi-column pages)
- Need specific design from template (navigation, sidebars)
- Creating page-level components

**Source:** `templates/wowdash/html/` or `templates/wowdash/dist/`

**Conversion Checklist:**
1. Copy HTML snippet from template
2. Convert `class` → `className`
3. Replace static data with props
4. Add TypeScript interface
5. Use Next.js `<Image>` and `<Link>`
6. Add "use client" if interactive

---

## 🎨 Design Tokens

### Colors
Configured in `tailwind.config.ts`:
- `primary`, `secondary` - Brand colors
- `success`, `warning`, `danger` - Semantic colors
- `background`, `foreground`, `muted`, `accent` - UI colors
- `card`, `card-foreground` - Card colors

### Typography
**Font:** Inter (via `next/font/google`)  
**Sizes:** `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`  
**Weights:** `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### Spacing
**Padding/Margin:** `p-2`, `p-4`, `p-6`, `p-8`  
**Gaps:** `gap-2`, `gap-4`, `gap-6`  
**Containers:** `max-w-screen-sm`, `max-w-screen-md`, `max-w-screen-lg`, `max-w-screen-xl`

### Border Radius
`rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`

---

## ♿ Accessibility Standards

### Semantic HTML
Use proper elements: `<button>`, `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`  
Avoid: `<div>` for interactive elements or structural landmarks

### ARIA Attributes
**Icon buttons:** `<button aria-label="Save job">...</button>`  
**Dialogs:** `aria-labelledby`, `aria-describedby`  
**Loading:** `role="status"`, `aria-live="polite"`

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use `tabIndex={0}` for custom interactive elements
- Handle `Enter` and `Space` keys for custom buttons
- Avoid `tabIndex` > 0

### Focus States
All interactive elements need visible focus:  
`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`

### Screen Reader Support
**Images:** Add alt text (`alt=""` for decorative)  
**Visually hidden:** Use `className="sr-only"`  
**Skip links:** Add for main content navigation

---

## 📱 Responsive Design

**Breakpoints:** `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`

**Mobile-First Pattern:** Start with mobile styles, add larger breakpoint overrides

**Common Patterns:**
- Grid columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Hide/Show: `hidden md:block`, `block md:hidden`
- Text sizes: `text-2xl md:text-3xl lg:text-4xl`

---

## 🧪 Component Patterns

### Server Component (Default)
No "use client" directive. Fetch data directly with Prisma.

### Client Component (Interactive)
Add "use client" at top. Use for event handlers, React hooks, browser APIs.

### Server Action Pattern
Create in `app/actions/` with "use server" directive. Use `revalidatePath()` for cache updates.

---

## 🎭 States

### Loading States
Use skeleton placeholders with `animate-pulse`. Wrap async components in `<Suspense>`.

### Error States
Create `error.tsx` files in route segments. Include error message and retry button.

### Empty States
Show icon, title, description, and optional action button when lists are empty.

---

## ✅ Component Checklist

Before marking complete:
- [ ] TypeScript interface with JSDoc
- [ ] "use client" if interactive
- [ ] Next.js Image/Link used
- [ ] ARIA labels and keyboard navigation
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Loading/error/empty states
- [ ] Tailwind + design tokens
- [ ] Accepts `className` prop
- [ ] Manually tested

---

## 📚 References

- **Shadcn/UI:** https://ui.shadcn.com
- **Next.js Image:** https://nextjs.org/docs/app/api-reference/components/image
- **Next.js Link:** https://nextjs.org/docs/app/api-reference/components/link
- **Tailwind CSS:** https://tailwindcss.com/docs
- **WCAG:** https://www.w3.org/WAI/WCAG21/quickref/
- **WowDash Template:** `templates/wowdash/html/`

---

**End of UI/UX Guidelines**