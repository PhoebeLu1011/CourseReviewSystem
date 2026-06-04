import {
  BookOpen,
  Calendar,
  MapPin,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { useSchedule } from "../context/ScheduleContext";

const WEEK_DAYS = [
  { key: "Mon", label: "週一" },
  { key: "Tue", label: "週二" },
  { key: "Wed", label: "週三" },
  { key: "Thu", label: "週四" },
  { key: "Fri", label: "週五" },
];

const RECOMMENDED_MIN = 12;
const RECOMMENDED_MAX = 18;

function CreditBadge({ total }: { total: number }) {
  if (total === 0) {
    return (
      <Badge variant="outline" className="text-xs ml-2 border-slate-200">
        尚未選課
      </Badge>
    );
  }

  if (total < RECOMMENDED_MIN) {
    return (
      <Badge className="bg-rose-500 text-white text-xs ml-2">
        偏低
      </Badge>
    );
  }

  if (total > RECOMMENDED_MAX) {
    return (
      <Badge className="bg-amber-500 text-white text-xs ml-2">
        偏高
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-500 text-white text-xs ml-2">
      適中
    </Badge>
  );
}

export default function Schedule() {
  const { scheduled, removeFromSchedule } = useSchedule();

  const totalCredits = scheduled.reduce((sum, course) => {
    return sum + Number(course.credits || 0);
  }, 0);

  const removeCourse = (courseID: string) => {
    removeFromSchedule(courseID);
  };

  const getCreditNotice = () => {
    if (totalCredits === 0) {
      return "你尚未加入任何課程。";
    }

    if (totalCredits < RECOMMENDED_MIN) {
      return `你目前已選 ${totalCredits} 學分，低於建議的 ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} 學分範圍，可以考慮再加入一些課程。`;
    }

    if (totalCredits > RECOMMENDED_MAX) {
      return `你目前已選 ${totalCredits} 學分，高於建議的 ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} 學分範圍，請確認課業負擔是否合適。`;
    }

    return `你目前已選 ${totalCredits} 學分，位於建議範圍內。`;
  };

  const showNotice =
    totalCredits > 0 &&
    (totalCredits < RECOMMENDED_MIN || totalCredits > RECOMMENDED_MAX);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">我的課表</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查看與管理你選取的課程
        </p>
      </div>

      {/* Schedule Summary */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800">課表總覽</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">已加入課程數</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {scheduled.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">總學分</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 flex items-center">
                {totalCredits}
                <CreditBadge total={totalCredits} />
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">建議學分</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {RECOMMENDED_MIN}-{RECOMMENDED_MAX}
              </p>
            </div>
          </div>

          {showNotice && (
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-muted-foreground">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-slate-400"
              />
              <p>{getCreditNotice()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">已選課程</h2>

        {scheduled.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-card p-8 text-center text-sm text-muted-foreground">
            尚未加入任何課程，前往{" "}
            <Link
              to="/courses"
              className="text-primary hover:underline font-medium"
            >
              課程總覽
            </Link>{" "}
            選擇你想要的課程。
          </div>
        ) : (
          scheduled.map((course) => (
            <Card
              key={course.courseID}
              className="border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/courses/${course.courseID}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-base font-bold text-slate-900 hover:text-primary transition-colors">
                      {course.serialNumber} - {course.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {course.credits} 學分
                      </Badge>

                      <Badge
                        variant="outline"
                        className="text-xs border-slate-200"
                      >
                        {course.department}
                      </Badge>
                    </div>
                  </Link>

                  <button
                    onClick={() => removeCourse(course.courseID)}
                    className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded shrink-0"
                    title="從課表移除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Info */}
                <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="shrink-0" />
                    <span>{course.professor}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0" />
                    <span>{course.schedule}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0" />
                    <span>{course.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b-2 border-dashed border-primary/40 pb-2">
          每週課表
        </h2>

        <div className="grid grid-cols-5 gap-3">
          {WEEK_DAYS.map(({ key, label }) => {
            const courses = scheduled.filter((course) =>
              course.days.includes(key)
            );

            const hasClass = courses.length > 0;

            return (
              <div
                key={key}
                className="rounded-xl border border-slate-100 bg-white p-3 min-h-[140px] flex flex-col gap-2 shadow-sm"
              >
                <p
                  className={`text-sm font-bold ${
                    hasClass ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {label}
                </p>

                {hasClass ? (
                  courses.map((course) => (
                    <div
                      key={course.courseID}
                      className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-2 text-xs"
                    >
                      <p className="font-bold text-primary line-clamp-2">
                        {course.title}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {course.timeSlot}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 mt-2">無課程</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-6 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-semibold">師大選課工具箱</p>
        <p>114 學年度第二學期</p>
      </footer>
    </div>
  );
}