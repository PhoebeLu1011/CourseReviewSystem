import { Link } from "react-router";
import {
  BookOpen,
  Calendar,
  Star,
  MessageSquare,
  Users,
  Bell,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";



const announcements = [
  {
    id: 1,
    title: "系統維護公告",
    content:
      "選課系統將於本週六凌晨 2:00 至 6:00 進行例行維護，請提前完成選課作業。",
    date: "2026-04-24",
    category: "System",
    isPinned: true,
  },
  {
    id: 2,
    title: "114 學年度第二學期退選截止日提醒",
    content:
      "提醒同學：本學期退選截止日即將到來，請把握時間確認選課狀況。",
    date: "2026-04-20",
    category: "Emergency",
    isPinned: false,
  },
  {
    id: 3,
    title: "歡迎使用新版選課工具箱",
    content:
      "新版工具箱全面升級，整合課程評價、課表管理與找組員功能，歡迎體驗！",
    date: "2026-04-15",
    category: "General",
    isPinned: false,
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  System: "系統公告",
  Emergency: "重要通知",
  General: "一般公告",
};

export default function Home() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : { role: "Guest", name: "訪客" };
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<
    (typeof announcements)[0] | null
  >(null);

  const isGuest = user.role === "Guest";

  const shortcuts = [
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

  return (
    <div className="flex flex-col gap-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl md:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600 opacity-30 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-blue-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            114 學年度第二學期
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            {isGuest ? (
              <>
                歡迎使用{" "}
                <span className="text-blue-300">師大選課工具箱</span>
              </>
            ) : (
              <>
                歡迎回來，{" "}
                <span className="text-blue-300">{user.name.split(" ")[0]}</span>！
              </>
            )}
          </h1>

          <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-slate-300">
            整合課程評價、找組員、課表管理與討論的一站式選課平台。
          </p>

          {isGuest && (
            <div className="flex flex-wrap gap-4">
              <Link
                to="/auth/login"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
              >
                立即登入 <ChevronRight size={18} />
              </Link>
              <Link
                to="/courses"
                className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 font-bold text-white"
              >
                瀏覽課程
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
                  shortcut.hoverColor
                )}
              >
                <div
                  className={clsx(
                    "shrink-0 rounded-xl p-3 transition-transform group-hover:scale-110",
                    shortcut.color
                  )}
                >
                  <shortcut.icon size={24} />
                </div>

                <div>
                  <h3 className="mb-1 font-bold text-slate-800">
                    {shortcut.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-500">
                    {shortcut.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-slate-800">公告欄</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                最新消息
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <button
                  key={announcement.id}
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className="flex w-full gap-4 p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="mt-0.5 shrink-0">
                    {announcement.category === "System" && (
                      <Info size={18} className="text-blue-500" />
                    )}
                    {announcement.category === "Emergency" && (
                      <AlertCircle size={18} className="text-rose-500" />
                    )}
                    {announcement.category === "General" && (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">
                        {announcement.title}
                      </h4>

                      {announcement.isPinned && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                          置頂
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-slate-400">
                      {new Date(announcement.date).toLocaleDateString("zh-TW", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b bg-slate-50 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {CATEGORY_LABEL[selectedAnnouncement.category] ?? selectedAnnouncement.category}
              </p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(selectedAnnouncement.date).toLocaleDateString(
                  "zh-TW",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  }
                )}
              </p>
            </div>

            <div className="p-6">
              <h3 className="mb-4 text-xl font-bold text-slate-900">
                {selectedAnnouncement.title}
              </h3>
              <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-600">
                {selectedAnnouncement.content}
              </p>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white transition-colors hover:bg-slate-800"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
