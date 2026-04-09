/**
 * =========================================================================
 * Application Routes Configuration
 * =========================================================================
 * Multi-step form routing setup
 * v1.12.500
 */

import { createBrowserRouter, Navigate } from "react-router";

// ─── Route components (loaded normally for now) ───────────────────────────
// Note: Lazy loading temporarily disabled due to dynamic import issues
import Splash from "./pages/online/splash";
import Welcome from "./pages/online/welcome";
import Contact from "./pages/online/contact";
import Address from "./pages/online/address";
import Inventory from "./pages/online/inventory";
import Miscellaneous from "./pages/online/miscellaneous";
import Confirmation from "./pages/online/confirmation";
import AdminSplash from "./pages/admin/AdminSplash";
import Admin from "./pages/admin/admin";
import Payees from "./pages/admin/payee";
import Profile from "./pages/profile/profile";

// Redirect helpers — used for removed routes and catch-all
function RedirectToAddress() { return <Navigate to="/address" replace />; }
function RedirectToRoot()    { return <Navigate to="/" replace />; }

export const router = createBrowserRouter([
  { path: "/",             element: <Navigate to="/online" replace /> },
  { path: "/online",       Component: Splash },
  { path: "/welcome",      Component: Welcome },
  { path: "/contact",      Component: Contact },
  { path: "/service",      Component: RedirectToAddress },  // removed page — redirect mid-flow users
  { path: "/address",      Component: Address },
  { path: "/inventory",    Component: Inventory },
  { path: "/miscellaneous", Component: Miscellaneous },
  { path: "/confirmation", Component: Confirmation },
  { path: "/admin",           Component: AdminSplash },
  { path: "/admin/dashboard", Component: Admin },
  { path: "/admin/payees",    Component: Payees },
  { path: "/profile",      Component: Profile },
  { path: "*",             Component: RedirectToRoot },     // catch-all
]);