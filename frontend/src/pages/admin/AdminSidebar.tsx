import { NavLink, Link } from "react-router";
import { 
  ShieldAlert, 
  Megaphone, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  Home
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const navItems = [
  { path: "/admin/audit", label: "Audit Center", icon: ShieldAlert },
  { path: "/admin/announcements", label: "Announcement Manager", icon: Megaphone },
  { path: "/admin/users", label: "User Control", icon: Users },
  { path: "/admin/settings", label: "System Settings", icon: Settings },
];

export function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside
      className={clsx(
        "bg-slate-900 text-slate-300 h-full flex flex-col transition-all duration-300 relative border-r border-slate-800",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-800 shrink-0 h-[89px]">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-inner">
              N
            </div>
            <span className="font-bold text-white tracking-wide whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
              Admin Panel
            </span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                )
              }
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={22} className="shrink-0" />
              {isExpanded && (
                <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <Link
          to="/"
          className={clsx(
            "flex items-center gap-4 px-3 py-3 rounded-lg w-full text-left text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors",
            !isExpanded && "justify-center"
          )}
          title={!isExpanded ? "Back to Site" : undefined}
        >
          <Home size={22} className="shrink-0" />
          {isExpanded && <span className="font-medium">Back to Site</span>}
        </Link>
        <button
          className={clsx(
            "flex items-center gap-4 px-3 py-3 rounded-lg w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors",
            !isExpanded && "justify-center"
          )}
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut size={22} className="shrink-0" />
          {isExpanded && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
