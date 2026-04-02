# Error Handling & Loading States Guide

**Version:** v1.12.400  
**Status:** ✅ Complete  
**Part of:** Optimization Plan Step 5

---

## Overview

This guide documents the error handling and loading state system implemented in Step 5 of the optimization plan. The system provides a consistent, user-friendly way to handle errors and loading states throughout the application.

---

## Components

### 1. ErrorBoundary

A React error boundary component that catches JavaScript errors anywhere in the child component tree.

**Location:** `/src/app/components/ErrorBoundary.tsx`  
**Styles:** `/src/styles/error-boundary.css`

**Usage:**

```tsx
import { ErrorBoundary } from '@/components';

// Wrap your component tree
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, errorInfo) => logError(error)}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- ✅ Catches unhandled errors in component tree
- ✅ Displays user-friendly fallback UI
- ✅ Try Again and Go Home actions
- ✅ Development-only stack trace viewer
- ✅ Optional custom fallback UI
- ✅ Optional error callback for logging

**Default Fallback UI:**
- Alert icon with error message
- Error details (error name and message)
- "Try Again" button (resets error boundary)
- "Go Home" button (navigates to `/`)
- Stack trace (development only)

---

### 2. LoadingSpinner

A reusable loading spinner with configurable size and message.

**Location:** `/src/app/components/LoadingSpinner.tsx`  
**Styles:** `/src/styles/loading.css`

**Usage:**

```tsx
import { LoadingSpinner } from '@/components';

// Default (medium size)
<LoadingSpinner />

// With custom size
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// With message
<LoadingSpinner message="Loading your data..." />

// With custom className
<LoadingSpinner className="my-custom-class" />
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `message`: Optional loading message
- `className`: Additional CSS classes

**Sizes:**
- `sm`: 1rem (16px)
- `md`: 2rem (32px)
- `lg`: 3rem (48px)

---

### 3. PageLoader

A full-page loading overlay with spinner and message.

**Location:** `/src/app/components/PageLoader.tsx`  
**Styles:** `/src/styles/loading.css`

**Usage:**

```tsx
import { PageLoader } from '@/components';

// Conditional rendering
{isLoading && <PageLoader />}

// With custom message
{isLoading && <PageLoader message="Submitting your order..." />}
```

**Features:**
- ✅ Full-screen overlay with blur effect
- ✅ Centers spinner in viewport
- ✅ Blocks interaction during loading
- ✅ Smooth fade-in animation
- ✅ Dark mode support

---

## Custom Hook

### useAsyncOperation

A reusable hook for managing async operations with loading states and error handling.

**Location:** `/src/app/hooks/useAsyncOperation.ts`

**Usage:**

```tsx
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

function MyComponent() {
  const { execute, loading, error, data, reset, retry } = useAsyncOperation();

  const handleSubmit = async () => {
    const result = await execute(async () => {
      return await apiCall();
    });
    
    if (result) {
      // Success handling
      console.log('Success:', result);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Loading...' : 'Submit'}
      </button>
      
      {error && (
        <div>
          Error: {error.message}
          <button onClick={retry}>Retry</button>
        </div>
      )}
      
      {data && <div>Success: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

**API:**

| Property | Type | Description |
|----------|------|-------------|
| `execute` | `(operation: () => Promise<T>) => Promise<T \| null>` | Execute an async operation |
| `loading` | `boolean` | Whether operation is in progress |
| `error` | `Error \| null` | Error from last operation |
| `data` | `T \| null` | Result from last operation |
| `reset` | `() => void` | Reset state to initial values |
| `retry` | `() => Promise<T \| null>` | Retry last operation |

**Features:**
- ✅ Automatic loading state management
- ✅ Error catching and reporting
- ✅ Cleanup on unmount (prevents memory leaks)
- ✅ Retry functionality
- ✅ TypeScript generic support

---

## CSS Classes

### Loading States

All loading-related CSS classes are in `/src/styles/loading.css`:

**Spinner:**
```css
.loading-spinner-container  /* Container with flexbox centering */
.loading-spinner            /* The spinning icon */
.loading-spinner-sm         /* Small size (16px) */
.loading-spinner-md         /* Medium size (32px) */
.loading-spinner-lg         /* Large size (48px) */
.loading-spinner-message    /* Loading message text */
```

**Page Loader:**
```css
.page-loader-overlay        /* Full-screen overlay with blur */
.page-loader-content        /* White card containing spinner */
```

**Additional Utilities:**
```css
.inline-loading             /* Inline loading state */
.btn-loading                /* Button loading state */
.btn-loading-spinner        /* Spinner for buttons */
```

**Skeleton Loaders:**
```css
.skeleton                   /* Base skeleton shimmer effect */
.skeleton-text              /* Text line skeleton */
.skeleton-title             /* Title skeleton */
.skeleton-avatar            /* Avatar/circle skeleton */
.skeleton-card              /* Card skeleton */
```

**Dots Loader:**
```css
.dots-loader                /* Pulsing dots container */
```

### Error Boundary

All error boundary CSS classes are in `/src/styles/error-boundary.css`:

```css
.error-boundary-container           /* Full-screen container */
.error-boundary-content             /* Content wrapper */
.error-boundary-icon-wrapper        /* Icon container */
.error-boundary-icon                /* Alert icon */
.error-boundary-title               /* Error title */
.error-boundary-message             /* Error message */
.error-boundary-error-details       /* Error details card */
.error-boundary-error-name          /* Error name/message */
.error-boundary-actions             /* Button container */
.error-boundary-btn                 /* Base button */
.error-boundary-btn-primary         /* Primary button */
.error-boundary-btn-secondary       /* Secondary button */
.error-boundary-btn-icon            /* Button icon */
.error-boundary-stack-trace         /* Stack trace details */
.error-boundary-stack-summary       /* Stack trace summary */
.error-boundary-stack-pre           /* Stack trace pre block */
```

---

## Implementation Details

### App-Level Error Boundary

The ErrorBoundary is wrapped around the entire application in `/src/app/App.tsx`:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FormProvider } from '@/context/FormContext';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';

export default function App() {
  return (
    <ErrorBoundary>
      <FormProvider>
        <RouterProvider router={router} />
      </FormProvider>
    </ErrorBoundary>
  );
}
```

This catches any unhandled errors throughout the entire application.

---

## Best Practices

### 1. Use ErrorBoundary for Component Protection

Wrap critical sections or entire routes in ErrorBoundary:

```tsx
// Protect a critical section
<ErrorBoundary fallback={<ErrorMessage />}>
  <CriticalComponent />
</ErrorBoundary>

// Protect a route
{
  path: "/critical",
  element: (
    <ErrorBoundary>
      <CriticalPage />
    </ErrorBoundary>
  )
}
```

### 2. Use useAsyncOperation for API Calls

Replace manual loading/error states with the hook:

```tsx
// ❌ Before
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setLoading(true);
  try {
    const result = await apiCall();
    // handle success
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

// ✅ After
const { execute, loading, error } = useAsyncOperation();

const handleSubmit = async () => {
  const result = await execute(async () => apiCall());
  if (result) {
    // handle success
  }
};
```

### 3. Use PageLoader for Full-Page Loading

Show PageLoader during heavy operations:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  await submitOrder();
  setIsSubmitting(false);
};

return (
  <>
    {isSubmitting && <PageLoader message="Submitting your order..." />}
    <form onSubmit={handleSubmit}>
      {/* form content */}
    </form>
  </>
);
```

### 4. Use LoadingSpinner for Inline Loading

Show LoadingSpinner within components:

```tsx
// Loading state within a card
<div className="card">
  {loading ? (
    <LoadingSpinner size="md" message="Loading data..." />
  ) : (
    <DataTable data={data} />
  )}
</div>

// Button loading state
<button disabled={loading}>
  {loading ? (
    <LoadingSpinner size="sm" />
  ) : (
    'Submit'
  )}
</button>
```

### 5. Skeleton Loaders for Content Placeholders

Use skeleton loaders for better perceived performance:

```tsx
{loading ? (
  <div>
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-card" />
  </div>
) : (
  <Content data={data} />
)}
```

---

## Testing Error Boundaries

To test the error boundary in development:

```tsx
// Create a component that throws an error
function ErrorTest() {
  throw new Error('Test error for ErrorBoundary');
}

// Use it in your app
<ErrorBoundary>
  <ErrorTest />
</ErrorBoundary>
```

---

## CSS Variables Used

The error boundary and loading components use the following CSS variables from `/src/styles/theme.css`:

```css
/* Colors */
--destructive
--destructive-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--background
--foreground
--muted
--muted-foreground
--card
--border

/* Spacing */
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl

/* Border Radius */
--radius-sm, --radius-md, --radius-lg

/* Shadows */
--shadow-lg, --shadow-2xl

/* Transitions */
--transition-base, --transition-fast, --transition-slow
--ease-in-out, --ease-out

/* Z-Index */
--z-modal
```

---

## Accessibility

### ErrorBoundary
- ✅ Semantic HTML structure
- ✅ ARIA labels for buttons
- ✅ Keyboard navigation support
- ✅ Focus management

### LoadingSpinner
- ✅ Uses `aria-label` or visible text
- ✅ Can be announced by screen readers

### PageLoader
- ✅ Modal overlay blocks interaction
- ✅ High z-index ensures visibility
- ✅ Announced to screen readers

---

## Future Enhancements

Potential improvements for future iterations:

1. **Error Logging Service Integration**
   - Send errors to Sentry, LogRocket, etc.
   - Track error frequency and patterns

2. **Custom Error Types**
   - Network errors
   - Validation errors
   - Authorization errors
   - Different UI for each type

3. **Loading Progress**
   - Progress bar component
   - Percentage-based loading
   - Multi-step operation progress

4. **Offline Detection**
   - Detect network status
   - Show offline indicator
   - Queue operations for retry

5. **Toast Notifications**
   - Success/error toasts
   - Dismissible notifications
   - Auto-dismiss after timeout

---

## Migration Guide

To migrate existing code to use the new error handling system:

### Step 1: Wrap with ErrorBoundary

```tsx
// Before
<YourComponent />

// After
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Step 2: Replace Manual Loading States

```tsx
// Before
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

// After
const { execute, loading, error } = useAsyncOperation();
```

### Step 3: Update API Calls

```tsx
// Before
setLoading(true);
try {
  const result = await apiCall();
  setData(result);
} catch (err) {
  setError(err);
} finally {
  setLoading(false);
}

// After
const result = await execute(async () => apiCall());
if (result) {
  setData(result);
}
```

### Step 4: Add Loading UI

```tsx
// Before
{data && <DataDisplay data={data} />}

// After
{loading && <LoadingSpinner message="Loading data..." />}
{data && <DataDisplay data={data} />}
```

---

## Summary

✅ **Implemented:**
- ErrorBoundary component with fallback UI
- LoadingSpinner component (3 sizes)
- PageLoader component (full-screen)
- useAsyncOperation custom hook
- Comprehensive CSS styling
- Documentation

✅ **Benefits:**
- Consistent error handling across the app
- Better user feedback during loading
- Graceful error recovery
- Improved user experience
- Easier async operation management
- Type-safe error handling

✅ **Coverage:**
- App-level error boundary in place
- Reusable components ready for use
- Custom hook for async operations
- Complete styling system
- Accessibility support

---

**Next Steps:**
- Apply loading states to existing pages (Contact, Address, Inventory, etc.)
- Replace manual loading states with useAsyncOperation hook
- Add error boundaries around critical sections
- Implement skeleton loaders for data-heavy pages
