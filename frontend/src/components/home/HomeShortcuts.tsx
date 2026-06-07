import type { LucideIcon } from "lucide-react";
import { BookOpen, Calendar, MessageSquare, Star, Users } from "lucide-react";
import { clsx } from "clsx";
import { Link } from "react-router";

interface Shortcut {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  borderColor: string;
  hoverColor: string;
}

export function HomeShortcuts({ isGuest }: { isGuest: boolean }) {
  const shortcuts = buildShortcuts(isGuest);

  return (
    <div className="space-y-6 lg:col-span-2">
      <h2 className="text-2xl font-bold text-slate-800">快速入口</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.title}
            to={shortcut.path}
            className={clsx(
              "group flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
              shortcut.borderColor,
              shortcut.hoverColor,
            )}
          >
            <div
              className={clsx(
                "shrink-0 rounded-xl p-3 transition-transform group-hover:scale-110",
                shortcut.color,
              )}
            >
              <shortcut.icon size={24} />
            </div>

            <div>
              <h3 className="mb-1 font-bold text-slate-800">{shortcut.title}</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-500">
                {shortcut.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function buildShortcuts(isGuest: boolean): Shortcut[] {
  return [
    {
      title: "課程總覽",
      description: "瀏覽與搜尋師大所有課程",
      icon: BookOpen,
      path: "/courses",
      color: "bg-blue-50 text-blue-700",
      borderColor: "border-blue-100",
      hoverColor: "hover:border-blue-300 hover:shadow-blue-100",
    },
    ...(!isGuest
      ? [
          {
            title: "我的課表",
            description: "管理你的每週上課時間表",
            icon: Calendar,
            path: "/schedule",
            color: "bg-emerald-50 text-emerald-700",
            borderColor: "border-emerald-100",
            hoverColor: "hover:border-emerald-300 hover:shadow-emerald-100",
          },
        ]
      : []),
    {
      title: "課程評價",
      description: "查看並撰寫課程評論",
      icon: Star,
      path: "/reviews",
      color: "bg-amber-50 text-amber-700",
      borderColor: "border-amber-100",
      hoverColor: "hover:border-amber-300 hover:shadow-amber-100",
    },
    {
      title: "討論區",
      description: "參與學術與校園話題討論",
      icon: MessageSquare,
      path: "/discussions",
      color: "bg-purple-50 text-purple-700",
      borderColor: "border-purple-100",
      hoverColor: "hover:border-purple-300 hover:shadow-purple-100",
    },
    {
      title: "找組員",
      description: "與同學配對，組成專題小組",
      icon: Users,
      path: "/groups",
      color: "bg-rose-50 text-rose-700",
      borderColor: "border-rose-100",
      hoverColor: "hover:border-rose-300 hover:shadow-rose-100",
    },
  ];
}
