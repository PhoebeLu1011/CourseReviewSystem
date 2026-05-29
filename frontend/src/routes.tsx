import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetail from "./pages/CourseDetail";
import DiscussionDetail from "./pages/DiscussionDetail";
import GroupmatesIntegrated from "./pages/GroupmatesIntegrated";
import UserProfile from "./pages/UserProfile";
import AdminLayout from "./pages/admin/AdminLayout";  // 修正：補上 Admin 路由
import Schedule from "./pages/Schedule";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        This page will be implemented later.
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "courses",
        element: <CourseCatalog />,
      },
      {
        path: "courses/:courseID",
        element: <CourseDetail />,
      },
      {
        path: "courses/:courseID/discussions/:discussionID",
        element: <DiscussionDetail />,
      },
      {
        path: "groups",
        element: <GroupmatesIntegrated />,
      },
      {
        path: "achievements",
        element: <PlaceholderPage title="Achievements" />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "reviews",
        element: <PlaceholderPage title="Course Reviews" />,
      },
      {
        path: "discussions",
        element: <PlaceholderPage title="Discussions" />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
    ],
  },
  // 修正：Admin panel 是獨立的 layout（不套用一般 Layout）
  {
    path: "/admin",
    element: <AdminLayout />,
  },
]);
