import { NavLink, Link, useNavigate } from "react-router";
import {
  ShieldAlert,
  Megaphone,
  LogOut,
  Menu,
  Home,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/admin/audit", label: "審核中心", icon: ShieldAlert },
  { path: "/admin/announcements", label: "公告管理", icon: Megaphone },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "relative flex h-full flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      <div className="flex h-[89px] shrink-0 items-center justify-between border-b border-slate-800 p-4">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-inner">
              N
            </div>

            <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap font-bold tracking-wide text-white">
              管理後台
            </span>
          </div>
        )}

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="收合側邊欄"
          type="button"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 space-y-2 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-4 rounded-lg px-3 py-3 transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                  !isExpanded && "justify-center",
                )
              }
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={22} className="shrink-0" />

              {isExpanded && (
                <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-slate-800 p-4">
        <Link
          to="/"
          className={clsx(
            "flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left text-indigo-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-300",
            !isExpanded && "justify-center",
          )}
          title={!isExpanded ? "返回主站" : undefined}
        >
          <Home size={22} className="shrink-0" />
          {isExpanded && <span className="font-medium">返回主站</span>}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className={clsx(
            "flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300",
            !isExpanded && "justify-center",
          )}
          title={!isExpanded ? "登出" : undefined}
        >
          <LogOut size={22} className="shrink-0" />
          {isExpanded && <span className="font-medium">登出</span>}
        </button>
      </div>
    </aside>
  );
}