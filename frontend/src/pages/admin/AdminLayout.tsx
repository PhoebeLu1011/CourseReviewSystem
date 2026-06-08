import { Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AnalyticsCards } from "./AnalyticsCards";
import { useAuth } from "../../context/AuthContext";

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
  const { user } = useAuth();

  const displayName = user?.name || "Admin";
  const roleLabel = user?.role?.toLowerCase() === "admin" ? "管理員" : "管理後台";
  const initials = getInitials(displayName);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800">
      <AdminSidebar />

      <div className="relative z-0 flex flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[89px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm sm:px-10">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              管理員儀表板
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              NTNU 選課工具箱
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="mx-1 h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
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
            </div>
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