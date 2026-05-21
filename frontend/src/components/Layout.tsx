import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold">
            Course Review System
          </Link>

          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Courses
            </Link>
            <Link to="/groups" className="hover:text-foreground">
              Groups
            </Link>
            <Link to="/achievements" className="hover:text-foreground">
              Achievements
            </Link>
            <Link to="/profile" className="hover:text-foreground">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}