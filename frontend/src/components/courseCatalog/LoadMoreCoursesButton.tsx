import { Loader2 } from "lucide-react";

import { Button } from "../ui/button";

interface LoadMoreCoursesButtonProps {
  hidden: boolean;
  loading: boolean;
  remaining: number;
  onLoadMore: () => void;
}

export function LoadMoreCoursesButton({
  hidden,
  loading,
  remaining,
  onLoadMore,
}: LoadMoreCoursesButtonProps) {
  if (hidden) return null;

  return (
    <div className="flex justify-center pt-2">
      <Button
        variant="outline"
        className="border-slate-200 px-8"
        disabled={loading}
        onClick={onLoadMore}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" /> 載入中...
          </span>
        ) : (
          `載入更多（還有 ${remaining} 門）`
        )}
      </Button>
    </div>
  );
}
