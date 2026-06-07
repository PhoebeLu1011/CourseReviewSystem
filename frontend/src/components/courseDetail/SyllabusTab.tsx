import { ExternalLink } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import type { CourseView } from "./courseDetailTypes";

export function SyllabusTab({ course }: { course: CourseView }) {
  return (
    <div className="space-y-5">
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-base font-bold text-slate-800">官方課程大綱</h3>

          <p className="text-sm text-muted-foreground">
            詳細課程大綱、評分標準、指定教材等資訊請參閱師大官方選課系統。
          </p>

          {course.syllabusURL ? (
            <a
              href={course.syllabusURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <ExternalLink size={15} /> 前往課程大綱頁面
            </a>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              此課程無大綱連結。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
