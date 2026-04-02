# Application Guidelines

## 📁 Documentation

All `.md` files live in `/guidelines/`. AI creates new docs here only.

## 📦 Import Aliases

**@ alias points to `/src/app`** (not `/src`). Use for all imports except styles.

```tsx
// ✅ Correct
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/lead";
import { MOCK_MODE } from "@/config";

// ❌ Wrong
import { Button } from "@/app/components/ui/button";
import "../../../components/ui/button";
```

See `/guidelines/IMPORT_ALIAS_GUIDE.md` for full details.

## ⚠️ Architecture

**Inertia.js + Laravel SSR** - No REST APIs. Pages receive props from Laravel controllers via `Inertia::render()`.

## 🔒 Locked Directories

The following directories are **locked** and require explicit Administrator approval before the AI may create, modify, or delete any file within them:

| Directory              | Lock Level                                          | How to unlock                         |
| ---------------------- | --------------------------------------------------- | ------------------------------------- |
| `/src/app/types/`      | **Approval lock** — AI must ask before every change | Administrator answers **Yes** in chat |
| `/src/app/components/` | **Approval lock** — AI must ask before every change | Administrator answers **Yes** in chat |
| `/src/app/pages/`      | **Approval lock** — AI must ask before every change | Administrator answers **Yes** in chat |
| `/src/app/hooks/`      | **Approval lock** — AI must ask before every change | Administrator answers **Yes** in chat |
| `/src/app/utils/`      | **Approval lock** — AI must ask before every change | Administrator answers **Yes** in chat |
| `/src/styles/`         | **Approval lock** — AI must ask before every change | Administrator answers **Yes** in chat |

### Approval protocol for `/src/app/components/`, `/src/app/pages/`, `/src/app/types/`, `/src/app/hooks/`, `/src/app/utils/`, and `/src/styles/`

Before modifying any file in a locked directory the AI **must** ask:

> "This change requires modifying `<file path>`, which is in a locked directory (`<directory>`). Do you approve this change? (Yes / No)"

- If the answer is **Yes** → proceed with the change.
- If the answer is **No**, is absent, or is ambiguous → do **not** touch the file.
- One approval covers only the specific file named in the question for that single request. It does not grant blanket access to the directory.

---

## 🎨 Styling

Some of the base components you are using may have styling (e.g. gap/typography) baked in as defaults.
So make sure you explicitly set any styling information from the guidelines in the generated React to override the defaults.

## 🔄 Navigation — Load / Reload Behaviour

**On every page load or browser reload, the app must redirect the user to the Splash page (`/`).**

- This applies to **all** pages in the multi-step form flow (welcome, location, and any future steps).
- It does **not** apply to the `/admin` page — the admin page may load normally.
- Implementation: each form-flow page must use a `useEffect` that checks `sessionStorage` for an `app_started` flag. If the flag is absent (i.e. a fresh load or reload), navigate to `/` immediately. The Splash page sets the flag when the user taps **Get Started**.

### Implementation pattern (required for every form-flow page)

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

// Inside the component, before the return:
const navigate = useNavigate();

useEffect(() => {
  if (!sessionStorage.getItem('app_started')) {
    navigate('/', { replace: true });
  }
}, [navigate]);
```

### Splash page — setting the flag

```tsx
// When the user taps "Get Started":
sessionStorage.setItem('app_started', 'true');
navigate('/welcome');
```

### Rules

- `sessionStorage` is used (not `localStorage`) so the flag is cleared automatically when the browser tab is closed.
- The flag key is always `app_started`.
- Never set the flag anywhere other than the Splash page's **Get Started** action.
- Any new form-flow page added in the future **must** include the guard `useEffect` above.