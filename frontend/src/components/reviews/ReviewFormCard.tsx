import type { FormEvent } from "react";
import { Loader2, Send } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { ReviewRatingIcons } from "./ReviewRatingIcons";

interface ReviewFormCardProps {
  courseID: string;
  content: string;
  sweetness: number;
  workload: number;
  isSubmitting: boolean;
  onCourseIDChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSweetnessChange: (value: number) => void;
  onWorkloadChange: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ReviewFormCard({
  courseID,
  content,
  sweetness,
  workload,
  isSubmitting,
  onCourseIDChange,
  onContentChange,
  onSweetnessChange,
  onWorkloadChange,
  onSubmit,
}: ReviewFormCardProps) {
  return (
    <Card className="border-primary/20 shadow-md bg-slate-50/50">
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 mb-4">撰寫評論</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">課程 ID</label>
              <Input
                value={courseID}
                onChange={(event) => onCourseIDChange(event.target.value)}
                placeholder="例：5002"
                required
              />
            </div>
          </div>
          <div className="flex gap-8 py-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">甜度</label>
              <ReviewRatingIcons
                rating={sweetness}
                type="sweetness"
                interactive
                setRating={onSweetnessChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">涼度</label>
              <ReviewRatingIcons
                rating={workload}
                type="workload"
                interactive
                setRating={onWorkloadChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">評論內容</label>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="分享你對這門課的想法、教授教學方式、作業難度等..."
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            送出評論
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
