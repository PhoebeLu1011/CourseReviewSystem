import { Outlet, useNavigate } from "react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AnalyticsCards } from "./AnalyticsCards";
import { Bell, Search } from "lucide-react";

type StoredUser = {
  id?: string | number | null;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
};

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInitials(name?: string) {
  if (!name) return "AD";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function AdminLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const displayName = user?.name || "Admin";
  const roleLabel = user?.role?.toLowerCase() === "admin" ? "管理員" : "Admin Panel";
  const initials = getInitials(displayName);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800">
      <AdminSidebar />

      <div className="relative z-0 flex flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[89px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm sm:px-10">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              NTNU Course Selection Toolbox
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 rounded-full border-none bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
              title="Notifications"
              type="button"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            <div className="mx-1 h-8 w-px bg-slate-200" />

            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
              title="Back to main site"
            >
              <div className="hidden text-right sm:block">
                <p className="mb-1 text-sm font-bold leading-none text-slate-800">
                  {displayName}
                </p>
                <p className="text-xs font-medium leading-none text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-sm font-bold text-white shadow-md">
                {initials}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/80 p-6 sm:p-10">
          <div className="mx-auto max-w-7xl">
            <AnalyticsCards />

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;