import { Link, Outlet, useLocation } from "react-router";
import {
  BookOpen,
  Star,
  MessageSquare,
  Users,
  Calendar,
  LogOut,
} from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/courses", label: "Courses", icon: BookOpen },
    { path: "/reviews", label: "Reviews", icon: Star },
    { path: "/discussions", label: "Discussions", icon: MessageSquare },
    { path: "/groups", label: "Find Groupmates", icon: Users },
    { path: "/schedule", label: "My Schedule", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <Link to="/" className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                NTNU
                <br />
                Toolbox
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                Course Selection
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-base font-semibold transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-6 border-l pl-8 md:flex">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-secondary"
            >
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="User avatar"
                className="h-10 w-10 rounded-full object-cover shadow-sm"
              />

              <span className="text-base font-bold leading-tight text-foreground">
                Alex
                <br />
                Johnson
              </span>
            </Link>

            <button
              type="button"
              className="text-muted-foreground transition-colors hover:text-destructive"
              title="Log out"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}