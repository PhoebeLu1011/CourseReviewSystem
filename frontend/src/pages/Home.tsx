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
    title: "System Maintenance This Weekend",
    content:
      "The course selection system will be down for scheduled maintenance this Saturday from 2:00 AM to 6:00 AM.",
    date: "2026-04-24",
    category: "System",
    isPinned: true,
  },
  {
    id: 2,
    title: "Spring 2026 Final Course Drop Deadline",
    content:
      "Reminder: The final deadline to drop courses for the Spring 2026 semester is approaching.",
    date: "2026-04-20",
    category: "Emergency",
    isPinned: false,
  },
  {
    id: 3,
    title: "Welcome to the New Toolbox",
    content:
      "We've redesigned the course selection toolbox with reviews, scheduling, and groupmate features.",
    date: "2026-04-15",
    category: "General",
    isPinned: false,
  },
];

export default function Home() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : { role: "Guest", name: "Guest User" };
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<
    (typeof announcements)[0] | null
  >(null);

  const isGuest = user.role === "Guest";

  const shortcuts = [
    {
      title: "Course Catalog",
      description: "Browse and search for courses",
      icon: BookOpen,
      path: "/courses",
      color: "bg-blue-50 text-blue-700",
      borderColor: "border-blue-100",
      hoverColor: "hover:border-blue-300 hover:shadow-blue-100",
    },
    ...(!isGuest
      ? [
          {
            title: "My Schedule",
            description: "Manage your weekly class timetable",
            icon: Calendar,
            path: "/schedule",
            color: "bg-emerald-50 text-emerald-700",
            borderColor: "border-emerald-100",
            hoverColor: "hover:border-emerald-300 hover:shadow-emerald-100",
          },
        ]
      : []),
    {
      title: "Course Reviews",
      description: "Read and write reviews for classes",
      icon: Star,
      path: "/reviews",
      color: "bg-amber-50 text-amber-700",
      borderColor: "border-amber-100",
      hoverColor: "hover:border-amber-300 hover:shadow-amber-100",
    },
    {
      title: "Discussions",
      description: "Join academic and campus conversations",
      icon: MessageSquare,
      path: "/discussions",
      color: "bg-purple-50 text-purple-700",
      borderColor: "border-purple-100",
      hoverColor: "hover:border-purple-300 hover:shadow-purple-100",
    },
    {
      title: "Find Groupmates",
      description: "Connect with peers for group projects",
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
            Spring 2026 Semester
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            {isGuest ? (
              <>
                Welcome to{" "}
                <span className="text-blue-300">Course Review System</span>
              </>
            ) : (
              <>
                Welcome back,{" "}
                <span className="text-blue-300">{user.name.split(" ")[0]}</span>!
              </>
            )}
          </h1>

          <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-slate-300">
            Your all-in-one platform for course reviews, group matching,
            schedules, and discussions.
          </p>

          {isGuest && (
            <div className="flex flex-wrap gap-4">
              <Link
                to="/auth/login"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
              >
                Sign In Now <ChevronRight size={18} />
              </Link>
              <Link
                to="/courses"
                className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 font-bold text-white"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-800">Quick Tools</h2>

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
            <h2 className="text-2xl font-bold text-slate-800">Announcements</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Latest Updates
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
                          Pinned
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-slate-400">
                      {new Date(announcement.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
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
                {selectedAnnouncement.category} Announcement
              </p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(selectedAnnouncement.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}