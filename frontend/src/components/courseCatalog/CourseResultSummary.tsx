import { Loader2 } from "lucide-react";

interface CourseResultSummaryProps {
  loading: boolean;
  total: number;
  savedOnly: boolean;
}

export function CourseResultSummary({
  loading,
  total,
  savedOnly,
}: CourseResultSummaryProps) {
  return (
    <p className="text-xl font-bold text-slate-800">
      {loading ? (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin" /> 搜尋中...
        </span>
      ) : (
        <>
          找到 {total.toLocaleString()} 門課程
          {savedOnly && (
            <span className="ml-2 text-sm font-normal text-rose-500">
              （已收藏）
            </span>
          )}
        </>
      )}
    </p>
  );
}
