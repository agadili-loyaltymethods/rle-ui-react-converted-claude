import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RouteError } from '../components/common/RouteError';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { LoginPage } from '../pages/login/LoginPage';
import { MembersPage } from '../pages/members/MembersPage';
import { MemberDetailsPage } from '../pages/member-details/MemberDetailsPage';
import { MemberTabPlaceholder } from '../pages/member-details/MemberTabPlaceholder';
import { ProgramsPage } from '../pages/programs/ProgramsPage';

// Lazy-loaded pages
const AnalyticsPage = lazy(() =>
  import('../pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const OrgsPage = lazy(() =>
  import('../pages/orgs/OrgsPage').then((m) => ({ default: m.OrgsPage }))
);
const SegmentsPage = lazy(() =>
  import('../pages/segments/SegmentsPage').then((m) => ({ default: m.SegmentsPage }))
);
const LocationsPage = lazy(() =>
  import('../pages/locations/LocationsPage').then((m) => ({ default: m.LocationsPage }))
);
const ProductsPage = lazy(() =>
  import('../pages/products/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const DmaPage = lazy(() =>
  import('../pages/dma/DmaPage').then((m) => ({ default: m.DmaPage }))
);
const EnumsPage = lazy(() =>
  import('../pages/enums/EnumsPage').then((m) => ({ default: m.EnumsPage }))
);
const LoyaltyCardsPage = lazy(() =>
  import('../pages/loyalty-cards/LoyaltyCardsPage').then((m) => ({
    default: m.LoyaltyCardsPage,
  }))
);
const NamedListsPage = lazy(() =>
  import('../pages/named-lists/NamedListsPage').then((m) => ({ default: m.NamedListsPage }))
);
const DivisionsPage = lazy(() =>
  import('../pages/divisions/DivisionsPage').then((m) => ({ default: m.DivisionsPage }))
);
const AclPage = lazy(() =>
  import('../pages/acl/AclPage').then((m) => ({ default: m.AclPage }))
);
const UsersPage = lazy(() =>
  import('../pages/users/UsersPage').then((m) => ({ default: m.UsersPage }))
);
const LimitsPage = lazy(() =>
  import('../pages/limits/LimitsPage').then((m) => ({ default: m.LimitsPage }))
);
const ExtensionsPage = lazy(() =>
  import('../pages/extensions/ExtensionsPage').then((m) => ({ default: m.ExtensionsPage }))
);
const McpUiConfigPage = lazy(() =>
  import('../pages/mcp-ui-config/McpUiConfigPage').then((m) => ({
    default: m.McpUiConfigPage,
  }))
);
const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const UserSettingsPage = lazy(() =>
  import('../pages/user-settings/UserSettingsPage').then((m) => ({
    default: m.UserSettingsPage,
  }))
);
const PoliciesPage = lazy(() =>
  import('../pages/policies/PoliciesPage').then((m) => ({ default: m.PoliciesPage }))
);
const RulesPage = lazy(() =>
  import('../pages/rules/RulesPage').then((m) => ({ default: m.RulesPage }))
);
const FlowPage = lazy(() =>
  import('../pages/flow/FlowPage').then((m) => ({ default: m.FlowPage }))
);

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // ─── Public routes (outside AppLayout) ───────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteError />,
  },

  // ─── Protected routes (inside AppLayout) ─────────────────────────────────
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    errorElement: <RouteError />,
    children: [
      // Members
      { index: true, element: <MembersPage /> },
      {
        path: 'details/:id',
        element: <MemberDetailsPage />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Navigate to="activities" replace /> },
          { path: ':tab', element: <MemberTabPlaceholder /> },
        ],
      },

      // Programs + nested sub-sections
      { path: 'programs', element: <ProgramsPage /> },
      {
        path: 'programs/:program/policies',
        element: <Wrap><PoliciesPage /></Wrap>,
      },
      {
        // AngularJS also used /programs/:id/rules and /rules/:program/:ruleFolder/:id
        path: 'programs/:program/rules',
        element: <Wrap><RulesPage /></Wrap>,
      },
      {
        path: 'programs/:program/flow',
        element: <Wrap><FlowPage /></Wrap>,
      },

      // Analytics
      { path: 'analytics', element: <Wrap><AnalyticsPage /></Wrap> },
      { path: 'analytics/*', element: <Wrap><AnalyticsPage /></Wrap> },

      // Reference data
      { path: 'orgs',     element: <Wrap><OrgsPage /></Wrap> },
      { path: 'segments', element: <Wrap><SegmentsPage /></Wrap> },
      { path: 'locations', element: <Wrap><LocationsPage /></Wrap> },
      { path: 'products', element: <Wrap><ProductsPage /></Wrap> },
      { path: 'dma', element: <Wrap><DmaPage /></Wrap> },
      { path: 'enums', element: <Wrap><EnumsPage /></Wrap> },
      { path: 'loyaltycards', element: <Wrap><LoyaltyCardsPage /></Wrap> },
      { path: 'namedlists', element: <Wrap><NamedListsPage /></Wrap> },
      { path: 'divisions', element: <Wrap><DivisionsPage /></Wrap> },

      // Admin
      { path: 'acl', element: <Wrap><AclPage /></Wrap> },
      { path: 'users', element: <Wrap><UsersPage /></Wrap> },
      { path: 'limits', element: <Wrap><LimitsPage /></Wrap> },
      { path: 'extensions', element: <Wrap><ExtensionsPage /></Wrap> },
      { path: 'mcp-ui-config', element: <Wrap><McpUiConfigPage /></Wrap> },
      { path: 'settings', element: <Wrap><SettingsPage /></Wrap> },
      { path: 'ussettings', element: <Wrap><UserSettingsPage /></Wrap> },

      // Catch-all inside app → back to home
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },

  // ─── Top-level fallback ───────────────────────────────────────────────────
  {
    path: '*',
    element: <RouteError />,
    errorElement: <RouteError />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
