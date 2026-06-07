import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import { RouteGuard } from "./components/auth/RouteGuard";

const Home = lazy(() => import("./pages/Home"));
const CourseCatalog = lazy(() => import("./pages/CourseCatalog"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const DiscussionDetail = lazy(() => import("./pages/DiscussionDetail"));
const GroupmatesIntegrated = lazy(() => import("./pages/GroupmatesIntegrated"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Discussions = lazy(() => import("./pages/Discussions"));
const AuditCenter = lazy(() =>
  import("./pages/admin/AuditCenter").then((module) => ({
    default: module.AuditCenter,
  }))
);
const AnnouncementEditor = lazy(() =>
  import("./pages/admin/AnnouncementEditor").then((module) => ({
    default: module.AnnouncementEditor,
  }))
);
const Login = lazy(() =>
  import("./pages/auth/Login").then((module) => ({ default: module.Login }))
);
const Register = lazy(() =>
  import("./pages/auth/Register").then((module) => ({ default: module.Register }))
);

function RouteFallback() {
  return (
    <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-sm">
      Loading page...
    </div>
  );
}

function lazyPage(children: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: lazyPage(<Home />),
      },
      {
        path: "auth/login",
        element: lazyPage(<Login />),
      },
      {
        path: "auth/register",
        element: lazyPage(<Register />),
      },
      {
        path: "courses",
        element: lazyPage(<CourseCatalog />),
      },
      {
        path: "courses/:courseID",
        element: lazyPage(<CourseDetail />),
      },
      {
        path: "courses/:courseID/discussions/:discussionID",
        element: lazyPage(<DiscussionDetail />),
      },
      {
        path: "groups",
        element: lazyPage(<GroupmatesIntegrated />),
      },
      {
        path: "achievements",
        element: <Navigate to="/profile" replace />,
      },
      {
        path: "schedule",
        element: lazyPage(<Schedule />),
      },
      {
        path: "reviews",
        element: lazyPage(<Reviews />),
      },
      {
        path: "discussions",
        element: lazyPage(<Discussions />),
      },
      {
        path: "profile",
        element: (
          <RouteGuard allowedRoles={["Student"]}>
            {lazyPage(<UserProfile />)}
          </RouteGuard>
        ),
      },
    ],
  },
  // 修正：Admin panel 是獨立的 layout（不套用一般 Layout）
  {
  path: "/admin",
  element: (
    <RouteGuard allowedRoles={["Admin"]}>
      {lazyPage(<AdminLayout />)}
    </RouteGuard>
  ),
  children: [
    { index: true, element: lazyPage(<AuditCenter />) },
    { path: "audit", element: lazyPage(<AuditCenter />) },
    { path: "announcements", element: lazyPage(<AnnouncementEditor />) },
  ],
  }
]);
