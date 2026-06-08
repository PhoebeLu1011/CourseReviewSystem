import { useEffect, useState } from "react";
import { Users, FileWarning, Megaphone, TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import {
  getAdminAnalyticsSummary,
  type AdminAnalyticsSummary,
} from "../../api/adminAnalyticsApi";

type StatCard = {
  title: string;
  value: string;
  icon: typeof FileWarning;
  trend: string;
  trendUp: boolean;
  color: string;
  bg: string;
};

export function AnalyticsCards() {
  const [summary, setSummary] = useState<AdminAnalyticsSummary>({
    pendingReports: 0,
    totalReports: 0,
    activeAnnouncements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      try {
        setSummary(await getAdminAnalyticsSummary());
      } catch (err) {
        console.error("載入管理員分析資料失敗：", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats: StatCard[] = [
    {
      title: "待處理檢舉",
      value: isLoading ? "..." : String(summary.pendingReports),
      icon: FileWarning,
      trend: "即時",
      trendUp: summary.pendingReports === 0,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "檢舉總數",
      value: isLoading ? "..." : String(summary.totalReports),
      icon: Users,
      trend: "全部",
      trendUp: true,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "啟用中公告",
      value: isLoading ? "..." : String(summary.activeAnnouncements),
      icon: Megaphone,
      trend: "即時",
      trendUp: true,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={clsx(
                "flex h-14 w-14 items-center justify-center rounded-xl shadow-inner",
                stat.bg,
                stat.color,
              )}
            >
              <Icon size={28} />
            </div>

            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">{stat.title}</h3>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>

                <span
                  className={clsx(
                    "flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                    stat.trendUp ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700",
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

            <div
              className={clsx(
                "absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-10 blur-2xl",
                stat.bg,
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
