import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router";

import { formatCourseDisplayCode } from "../../utils/courseDisplay";
import { Card, CardContent } from "../ui/card";
import type { FavoriteCourse } from "./profileTypes";

interface FavoriteCoursesPanelProps {
  courses: FavoriteCourse[];
  isLoading: boolean;
}

export function FavoriteCoursesPanel({
  courses,
  isLoading,
}: FavoriteCoursesPanelProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">載入中...</p>;
  }
  if (courses.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 shadow-none">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">尚無收藏課程</h2>
          <p className="mt-2 text-sm text-slate-500">
            前往{" "}
            <Link to="/courses" className="font-medium text-primary hover:underline">
              課程總覽
            </Link>{" "}
            收藏你感興趣的課程。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {courses.map((course) => {
        const parsed = parseNTNUSchedule(course.timeAndLocation);
        const displayCode =
          course.courseCode || formatCourseDisplayCode(course.courseID);
        return (
          <Link key={course.courseID} to={`/courses/${course.courseID}`}>
            <Card className="border-slate-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="space-y-2 p-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {displayCode}
                  </p>
                  <h3 className="mt-0.5 text-base font-bold leading-snug text-slate-900">
                    {course.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {course.department || "尚無開課單位"}
                </p>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {parsed.schedule}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    {parsed.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function parseNTNUSchedule(value?: string) {
  if (!value) {
    return { schedule: "尚無時間資料", location: "尚無地點資料" };
  }
  const parts = value.split(/\s+/).filter(Boolean);
  return {
    schedule: parts[0] || value,
    location: parts.slice(1).join(" ") || "尚無地點資料",
  };
}
