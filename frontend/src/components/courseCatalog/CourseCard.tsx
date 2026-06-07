import type { MouseEvent } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import { parseNTNUSchedule, type Course } from "../../api/courseApi";
import type { ScheduledCourse } from "../../context/ScheduleContext";
import { formatCourseDisplayCode } from "../../utils/courseDisplay";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface CourseCardProps {
  course: Course;
  isSaved: boolean;
  isBookmarkLoading: boolean;
  isScheduled: boolean;
  onBookmark: (event: MouseEvent<HTMLButtonElement>, courseID: string) => void;
  onAddToSchedule: (course: ScheduledCourse) => void;
}

export function CourseCard({
  course,
  isSaved,
  isBookmarkLoading,
  isScheduled,
  onBookmark,
  onAddToSchedule,
}: CourseCardProps) {
  const parsed = parseNTNUSchedule(course.timeAndLocation);
  const professor = course.professors.join("、");
  const titleParts = course.title.split(/<\/?br\s*\/?>/i);
  const mainTitle = titleParts[0];
  const subTitle = titleParts[1] ? titleParts[1].trim() : "";
  const displayCode = course.serialNumber || formatCourseDisplayCode(course.courseID);

  return (
    <Link to={`/courses/${course.courseID}`} className="block group">
      <Card className="overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div>
                <span className="text-base font-bold text-slate-700">
                  {displayCode}
                </span>
                <CourseStats
                  sweetness={course.averageSweetness}
                  workload={course.averageWorkload}
                  count={course.reviewCount}
                />
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                {mainTitle}
                {subTitle && (
                  <span className="block text-sm font-normal text-muted-foreground mt-1 group-hover:text-primary/70">
                    {subTitle}
                  </span>
                )}
              </h2>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge className="bg-primary text-primary-foreground text-xs whitespace-nowrap">
                {course.department}
              </Badge>
              <button
                disabled={isBookmarkLoading}
                onClick={(event) => onBookmark(event, course.courseID)}
                className={`rounded-full p-1.5 transition-colors ${
                  isSaved
                    ? "text-rose-500 hover:text-rose-600"
                    : "text-muted-foreground hover:text-rose-400"
                }`}
                title={isSaved ? "取消收藏" : "收藏"}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            {professor && (
              <InfoLine icon={<BookOpen size={14} className="shrink-0" />}>
                {professor}
              </InfoLine>
            )}
            <InfoLine icon={<Calendar size={14} className="shrink-0" />}>
              {parsed.schedule}
            </InfoLine>
            <InfoLine icon={<MapPin size={14} className="shrink-0" />}>
              {parsed.location}
            </InfoLine>
            {course.capacity > 0 && (
              <InfoLine icon={<Users size={14} className="shrink-0" />}>
                名額 {course.capacity} 人
              </InfoLine>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs border-slate-200 text-muted-foreground"
            >
              {course.courseCode}
            </Badge>
            {course.syllabusURL && (
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  window.open(course.syllabusURL, "_blank");
                }}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                課程大綱 ↗
              </button>
            )}
          </div>

          <div
            className="pt-1"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAddToSchedule({
                courseID: course.courseID,
                serialNumber: displayCode,
                title: course.title,
                department: course.department,
                credits: course.credits,
                professor,
                schedule: parsed.schedule,
                location: parsed.location,
                days: parsed.days,
                timeSlot: parsed.timeSlot,
              });
            }}
          >
            <Button
              className={`w-full font-semibold transition-colors ${
                isScheduled ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""
              }`}
              size="sm"
            >
              {isScheduled ? "✓ 已加入課表" : "加入課表"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseStats({
  sweetness,
  workload,
  count,
}: {
  sweetness: number;
  workload: number;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 text-sm font-semibold mt-1">
      <span className="flex items-center gap-1 text-amber-500" title="Average Sweetness">
        <Star size={14} className="fill-amber-400 text-amber-400" />
        {sweetness.toFixed(1)}
      </span>
      <span className="flex items-center gap-1 text-blue-500" title="Average Workload">
        <BookOpen size={14} className="fill-blue-400 text-blue-400" />
        {workload.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground font-normal ml-1">
        ({count} 則評價)
      </span>
    </div>
  );
}

function InfoLine({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </div>
  );
}
