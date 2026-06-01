import {
  BookOpen,
  Calendar,
  MapPin,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { useSchedule } from "../context/ScheduleContext";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const RECOMMENDED_MIN = 12;
const RECOMMENDED_MAX = 18;

// ─── Credit load label ────────────────────────────────────────
function CreditBadge({ total }: { total: number }) {
  if (total < RECOMMENDED_MIN) {
    return (
      <Badge className="bg-rose-500 text-white text-xs ml-2">Low</Badge>
    );
  }
  if (total > RECOMMENDED_MAX) {
    return (
      <Badge className="bg-amber-500 text-white text-xs ml-2">High</Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500 text-white text-xs ml-2">Good</Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Schedule() {
  const { scheduled, removeFromSchedule } = useSchedule();

  const totalCredits = scheduled.reduce((s, c) => s + c.credits, 0);

  const removeCourse = (courseID: string) => removeFromSchedule(courseID);

  const creditNotice = () => {
    if (totalCredits === 0) return "You haven't added any courses yet.";
    if (totalCredits < RECOMMENDED_MIN)
      return `You're currently enrolled in ${totalCredits} credits. Consider adding more courses to meet the recommended ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} credit range.`;
    if (totalCredits > RECOMMENDED_MAX)
      return `You're currently enrolled in ${totalCredits} credits, which exceeds the recommended ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} credit range.`;
    return `You're on track with ${totalCredits} credits within the recommended range.`;
  };

  const showNotice = totalCredits < RECOMMENDED_MIN || totalCredits > RECOMMENDED_MAX;

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage your selected courses
        </p>
      </div>

      {/* Schedule Summary */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800">Schedule Summary</h2>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{scheduled.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 flex items-center">
                {totalCredits}
                <CreditBadge total={totalCredits} />
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommended</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {RECOMMENDED_MIN}-{RECOMMENDED_MAX}
              </p>
            </div>
          </div>

          {showNotice && (
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-muted-foreground">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <p>{creditNotice()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Selected Courses</h2>

        {scheduled.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-card p-8 text-center text-sm text-muted-foreground">
            No courses added yet. Browse the{" "}
            <a href="/courses" className="text-primary hover:underline font-medium">
              Course Catalog
            </a>{" "}
            to add courses.
          </div>
        ) : (
          scheduled.map((course) => (
            <Card key={course.courseID} className="border-slate-100 shadow-sm">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {course.serialNumber} - {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {course.credits} Credits
                      </Badge>
                      <Badge variant="outline" className="text-xs border-slate-200">
                        {course.department}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCourse(course.courseID)}
                    className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded"
                    title="Remove from schedule"
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
          Weekly Schedule
        </h2>

        <div className="grid grid-cols-5 gap-3">
          {WEEK_DAYS.map((day) => {
            const courses = scheduled.filter((c) => c.days.includes(day));
            const hasClass = courses.length > 0;

            return (
              <div
                key={day}
                className="rounded-xl border border-slate-100 bg-white p-3 min-h-[140px] flex flex-col gap-2 shadow-sm"
              >
                <p className={`text-sm font-bold ${hasClass ? "text-slate-800" : "text-slate-400"}`}>
                  {day}
                </p>

                {hasClass ? (
                  courses.map((course) => (
                    <div
                      key={course.courseID}
                      className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-2 text-xs"
                    >
                      <p className="font-bold text-primary line-clamp-2">{course.title}</p>
                      <p className="text-muted-foreground mt-0.5">{course.timeSlot}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 mt-2">No classes</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-6 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-semibold">NTNU Course Selection Toolbox</p>
        <p>Spring 2026 • Academic Year 2025-2026</p>
      </footer>
    </div>
  );
}
