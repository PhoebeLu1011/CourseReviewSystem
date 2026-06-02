import { Calendar } from "lucide-react";
import type { CourseDetail } from "./types";

interface GroupCourseDetailsProps {
  courseDetail?: CourseDetail;
  isLoading: boolean;
}

export function GroupCourseDetails({
  courseDetail,
  isLoading,
}: GroupCourseDetailsProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      {isLoading && !courseDetail ? (
        <p className="text-sm text-slate-500">Loading course details...</p>
      ) : courseDetail ? (
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <div className="font-medium text-slate-900">
              {courseDetail.courseID} · {courseDetail.title}
            </div>
            <p className="mt-1 text-slate-600">
              {courseDetail.department} · {courseDetail.professors}
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>
              {courseDetail.academicYear} {courseDetail.semester}
            </span>
          </div>
          <div className="text-slate-600">Serial: {courseDetail.serialNumber}</div>
          <div className="text-slate-600">Time: {courseDetail.timeAndLocation}</div>
          <div className="text-slate-600">
            Sweetness: {courseDetail.averageSweetness.toFixed(1)}
          </div>
          <div className="text-slate-600">
            Workload: {courseDetail.averageWorkload.toFixed(1)} ·{" "}
            {courseDetail.reviewCount} reviews
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Course details are unavailable.</p>
      )}
    </div>
  );
}
