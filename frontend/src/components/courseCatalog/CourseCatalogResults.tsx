import type { MouseEvent } from "react";

import type { Course } from "../../api/courseApi";
import type { ScheduledCourse } from "../../context/ScheduleContext";
import { CourseCard } from "./CourseCard";

interface CourseCatalogResultsProps {
  courses: Course[];
  savedOnly: boolean;
  bookmarked: Record<string, boolean>;
  loadingBookmark: Record<string, boolean>;
  isScheduled: (courseID: string) => boolean;
  onBookmark: (event: MouseEvent<HTMLButtonElement>, courseID: string) => void;
  onAddToSchedule: (course: ScheduledCourse) => void;
}

export function CourseCatalogResults({
  courses,
  savedOnly,
  bookmarked,
  loadingBookmark,
  isScheduled,
  onBookmark,
  onAddToSchedule,
}: CourseCatalogResultsProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-card p-12 text-center text-muted-foreground">
        {savedOnly ? "你還沒有收藏任何課程。" : "找不到符合的課程，請嘗試其他關鍵字。"}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 items-start">
      {courses.map((course) => (
        <div key={course.courseID}>
          <CourseCard
            course={course}
            isSaved={!!bookmarked[course.courseID]}
            isBookmarkLoading={!!loadingBookmark[course.courseID]}
            isScheduled={isScheduled(course.courseID)}
            onBookmark={onBookmark}
            onAddToSchedule={onAddToSchedule}
          />
        </div>
      ))}
    </div>
  );
}
