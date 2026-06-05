import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Star, MessageSquare, Users, Calendar, LogOut, LogIn, ShieldAlert } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001/api";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "Admin";

  const navItems = isAdmin
    ? [
        { path: "/admin", label: "管理員系統", icon: ShieldAlert },
        { path: "/admin/reports", label: "檢舉審核", icon: MessageSquare },
        { path: "/admin/announcements", label: "公告管理", icon: BookOpen },
      ]
    : [
        { path: "/courses", label: "課程", icon: BookOpen },
        { path: "/reviews", label: "評價", icon: Star },
        { path: "/discussions", label: "討論", icon: MessageSquare },
        { path: "/groups", label: "找組員", icon: Users },
        ...(user
          ? [{ path: "/schedule", label: "我的課表", icon: Calendar }]
          : []),
      ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
              {isAdmin ? (
                <ShieldAlert className="h-7 w-7 text-primary-foreground" />
              ) : (
                <BookOpen className="h-7 w-7 text-primary-foreground" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                NTNU
                <br />
                Toolbox
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                {isAdmin ? "管理員系統" : "選課工具箱"}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

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
            {user ? (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/profile"}
                  className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-secondary"
                >
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 overflow-hidden bg-gradient-to-tr from-rose-500 to-amber-400">
                    {!isAdmin && user?.avatar ? (
                      <img
                        src={`${API_BASE_URL}/user/avatar/${user.avatar}`}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {isAdmin ? (
                          <ShieldAlert className="h-5 w-5" />
                        ) : user?.name ? (
                          user.name.charAt(0).toUpperCase()
                        ) : (
                          "U"
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-base font-bold leading-tight text-foreground">
                    {user.name || user.account || "User"}
                    <br />
                    <span className="text-xs font-normal text-muted-foreground">
                      {isAdmin ? "管理員" : user.role}
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  title="Log out"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-base font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90"
              >
                <LogIn className="h-5 w-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}