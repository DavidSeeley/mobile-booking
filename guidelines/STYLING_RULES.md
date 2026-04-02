# Styling Rules

## CRITICAL Rule
**ALL visual styling in CSS files - NEVER in components or pages.**

This rule applies equally to:
- `/src/app/components/` — all reusable components
- `/src/app/pages/` — all page-level files

---

## Forbidden in Components AND Pages

```tsx
// ❌ WRONG — inline style object
<div style={{ color: '#334155', fontSize: '12px' }}>

// ❌ WRONG — Tailwind visual utilities
<div className="text-blue-500 font-bold text-lg">

// ✅ RIGHT — named CSS class only
<div className="header-title">

// CSS file (index.css):
.header-title {
  color: var(--blue-500);
  font-weight: 700;
  font-size: 18px;
}
```

---

## CSS Architecture

### Files
- `/src/styles/theme.css` — Design tokens (colors, spacing, radii, shadows)
- `/src/styles/index.css` — All component and page classes
- `/src/styles/fonts.css` — Font `@import` declarations (top of file only)
- `/src/styles/tailwind.css` — Tailwind config / directives

### How to reference styles in a page or component

Every page and component must reference styles **only** via:

1. **CSS class names** passed through `className` props
2. **CSS custom properties** (tokens) defined in `theme.css` and consumed inside `index.css`

```tsx
// ✅ Page file — reference only via className
export default function WelcomePage() {
  return (
    <div className="welcome-page">
      <h1 className="welcome-title">Welcome</h1>
      <button className="welcome-cta-button">Get Started</button>
    </div>
  );
}
```

```css
/* index.css — all visual rules live here */
.welcome-page {
  background: var(--bg-primary);
  padding: var(--spacing-lg);
}

.welcome-title {
  color: var(--text-heading);
  font-size: 24px;
  font-weight: 700;
}

.welcome-cta-button {
  background: var(--blue-500);
  color: #fff;
  border-radius: var(--radius-md);
  padding: 10px 24px;
}
```

### Token Pattern

```css
/* theme.css — define tokens */
:root {
  --blue-500: #3b82f6;
  --text-primary: #1e293b;
  --text-heading: #0f172a;
  --bg-primary: #f8fafc;
  --spacing-lg: 24px;
  --radius-md: 8px;
}

/* index.css — consume tokens in named classes */
.component-name {
  color: var(--text-primary);
  background: var(--blue-500);
}
```

---

## Page Pattern (required)

Every file in `/src/app/pages/` must follow this pattern:

```tsx
// page file — structure + className refs ONLY, zero visual values
export default function SomePage() {
  return (
    <div className="some-page">
      <header className="some-page-header">
        <h1 className="some-page-title">Title</h1>
      </header>
      <main className="some-page-body">
        {/* content */}
      </main>
    </div>
  );
}
```

```css
/* index.css — ALL visual rules for the page */
.some-page { ... }
.some-page-header { ... }
.some-page-title { ... }
.some-page-body { ... }
```

---

## Component Pattern

```tsx
// Component file — structure + className refs ONLY
<div className="search-header">
  <button className="search-button">Search</button>
</div>
```

```css
/* index.css */
.search-header {
  display: flex;
  padding: 16px;
  gap: 12px;
}

.search-button {
  background: var(--blue-400);
  color: white;
  font-size: 12px;
  font-weight: 400;
}
```

---

## Allowed Tailwind (layout/structure only)

Tailwind may **only** be used for layout and structural utilities. Visual values must still come from CSS classes.

```tsx
// ✅ Layout utilities — allowed
className="flex gap-4 p-2"
className="grid grid-cols-3"
className="w-full h-screen"
className="relative overflow-hidden"

// ❌ Visual utilities — forbidden
className="text-blue-500"
className="font-bold"
className="bg-gray-100"
className="rounded-lg shadow-md"
```

---

## Key Classes (index.css reference)

### Forms
- `.form-floating-input` — Borderless bottom-border-only input
- `.form-field-wrapper` — Field container
- `.form-checkbox` — Minimal checkbox

### Tables
- `.search-list-table` — Table element
- `.search-list-header` — Blue gradient header
- `.search-list-row` — Table rows
- `.search-list-cell` — Table cells

### Modals
- `.search-modal` — Modal container (15px border-radius)
- `.search-modal-header` — Modal header (rounded top)

### Grid Cards
- `.grid-card` — Card container
- `.grid-card-field` — Field wrapper

---

## Typography Standard
- **Form fields:** 12px / 400 weight
- **Labels:** Defined in CSS classes
- **Headers:** Defined in `theme.css`

---

## Props-based Class Switching

When a component or page needs conditional styling, pass the variant via props and map to CSS class names — never inline a style value:

```tsx
// ✅ RIGHT
type ButtonVariant = 'primary' | 'secondary' | 'danger';
const variantClass: Record<ButtonVariant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
};

<button className={variantClass[variant]}>Save</button>

// ❌ WRONG
<button style={{ background: variant === 'danger' ? 'red' : 'blue' }}>Save</button>
```

---

**See `/src/styles/index.css` for the complete class reference.**
**See `/src/styles/theme.css` for all design tokens.**
