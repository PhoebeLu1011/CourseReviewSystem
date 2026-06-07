import { BookOpen, Calendar, MapPin, Users } from "lucide-react";
import type React from "react";

import { Card, CardContent } from "../ui/card";
import type { CourseView } from "./courseDetailTypes";

export function OverviewTab({ course }: { course: CourseView }) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <InfoBlock icon={<BookOpen size={15} />} label="授課教師">
            {course.professor || "未知"}
          </InfoBlock>

          <InfoBlock icon={<Calendar size={15} />} label="上課時間">
            <span>{course.timeAndLocation}</span>
            <span className="text-xs">{course.schedule}</span>
          </InfoBlock>

          <InfoBlock icon={<MapPin size={15} />} label="上課地點">
            {course.location}
          </InfoBlock>

          {course.capacity > 0 && (
            <InfoBlock icon={<Users size={15} />} label="課程名額">
              {course.capacity} 人
            </InfoBlock>
          )}
        </div>

        <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-5 text-sm text-muted-foreground">
          <span>學年：{course.academicYear}</span>
          <span>學期：{course.semester === "1" ? "第一學期" : "第二學期"}</span>
          <span>開課序號：{course.serialNumber}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {icon} {label}
      </div>
      <p className="flex flex-col gap-1 pl-5 text-sm text-muted-foreground">
        {children}
      </p>
    </div>
  );
}
