import { Users, FileWarning, Megaphone, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

const stats = [
  {
    title: "Total Pending Reports",
    value: "142",
    icon: FileWarning,
    trend: "+12%",
    trendUp: true,
    color: "text-amber-600",
    bg: "bg-amber-100",
    ring: "ring-amber-200"
  },
  {
    title: "Monthly Active Students",
    value: "12,450",
    icon: Users,
    trend: "+5.4%",
    trendUp: true,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    ring: "ring-indigo-200"
  },
  {
    title: "Active Announcements",
    value: "8",
    icon: Megaphone,
    trend: "-2",
    trendUp: false,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    ring: "ring-emerald-200"
  },
];

export function AnalyticsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div
              className={clsx(
                "w-14 h-14 rounded-xl flex items-center justify-center shadow-inner",
                stat.bg,
                stat.color
              )}
            >
              <Icon size={28} />
            </div>
            <div>
              <h3 className="text-gray-500 font-medium text-sm mb-1">{stat.title}</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span
                  className={clsx(
                    "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                    stat.trendUp ? "text-green-700 bg-green-100" : "text-rose-700 bg-rose-100"
                  )}
                >
                  <TrendingUp
                    size={12}
                    className={clsx("mr-1", !stat.trendUp && "rotate-180")}
                  />
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className={clsx("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-2xl", stat.bg)}></div>
          </div>
        );
      })}
    </div>
  );
}
