import { useEffect, useState } from "react";
import { Users, FileWarning, Megaphone, TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import { API_BASE_URL } from "../../config/api";

type Report = {
  status: "PENDING" | "RESOLVED" | "DISMISSED" | "WITHDRAWN";
};

type Announcement = {
  announcementID: string;
  is_pinned?: boolean;
};

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
  const [pendingReports, setPendingReports] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [activeAnnouncements, setActiveAnnouncements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      try {
        const [reportsRes, announcementsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/reports/all`),
          fetch(`${API_BASE_URL}/admin/announcements`),
        ]);

        const reports: Report[] = reportsRes.ok ? await reportsRes.json() : [];
        const announcements: Announcement[] = announcementsRes.ok
          ? await announcementsRes.json()
          : [];

        setPendingReports(reports.filter((report) => report.status === "PENDING").length);
        setTotalReports(reports.length);
        setActiveAnnouncements(announcements.length);
      } catch (err) {
        console.error("Failed to load admin analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats: StatCard[] = [
    {
      title: "Pending Reports",
      value: isLoading ? "..." : String(pendingReports),
      icon: FileWarning,
      trend: "Live",
      trendUp: pendingReports === 0,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Total Reports",
      value: isLoading ? "..." : String(totalReports),
      icon: Users,
      trend: "All",
      trendUp: true,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Active Announcements",
      value: isLoading ? "..." : String(activeAnnouncements),
      icon: Megaphone,
      trend: "Live",
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