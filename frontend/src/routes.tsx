import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CourseCatalog from "./pages/CourseCatalog";
import GroupmatesIntegrated from "./pages/GroupmatesIntegrated";
import UserProfile from "./pages/UserProfile";

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
        path: "groups",
        element: <GroupmatesIntegrated />,
      },
      {
        path: "achievements",
        element: <PlaceholderPage title="Achievements" />,
      },
      {
        path: "schedule",
        element: <PlaceholderPage title="My Schedule" />,
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
]);