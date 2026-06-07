import type { Dispatch, SetStateAction } from "react";
import { Edit2, Save, Trash2 } from "lucide-react";

import type { Review } from "../../api/reviewApi";
import { cleanCourseTitle, formatCourseDisplayCode } from "../../utils/courseDisplay";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { ReviewEditForm } from "./profileTypes";

interface ReviewsPanelProps {
  reviews: Review[];
  isLoading: boolean;
  editingReviewId: string | null;
  editForm: ReviewEditForm;
  onEditingReviewChange: (reviewId: string | null) => void;
  onEditFormChange: Dispatch<SetStateAction<ReviewEditForm>>;
  onUpdate: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

export function ReviewsPanel({
  reviews,
  isLoading,
  editingReviewId,
  editForm,
  onEditingReviewChange,
  onEditFormChange,
  onUpdate,
  onDelete,
}: ReviewsPanelProps) {
  if (isLoading) return <p className="text-sm text-slate-500">載入評論中...</p>;
  if (reviews.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 shadow-none">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">尚無評論</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            你發表過的課程評論會顯示在這裡。
          </p>
        </CardContent>
      </Card>
    );
  }

  return reviews.map((review) => {
    const isEditing = editingReviewId === review.reviewID;
    const date = review.timestamp
      ? new Date(review.timestamp).toLocaleDateString()
      : "尚無日期";
    const courseTitle = cleanCourseTitle(review.courseName);
    const courseCode = formatCourseDisplayCode(review.courseID);
    return (
      <Card key={review.reviewID} className="border-slate-100 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {courseTitle || `Course ID: ${courseCode}`}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">{date}</p>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onEditingReviewChange(review.reviewID);
                    onEditFormChange({
                      content: review.content,
                      sweetnessScore: review.sweetnessScore,
                      workloadScore: review.workloadScore,
                    });
                  }}
                  className="p-1.5 text-slate-400 transition-colors hover:text-slate-700"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(review.reviewID)}
                  className="p-1.5 text-slate-400 transition-colors hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <ReviewEditor
              form={editForm}
              onChange={onEditFormChange}
              onCancel={() => onEditingReviewChange(null)}
              onSave={() => onUpdate(review.reviewID)}
            />
          ) : (
            <>
              <div className="mb-2 flex gap-4">
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600">
                  Sweetness: {review.sweetnessScore}/5
                </Badge>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">
                  Workload: {review.workloadScore}/5
                </Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {review.content}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  });
}

function ReviewEditor({
  form,
  onChange,
  onCancel,
  onSave,
}: {
  form: ReviewEditForm;
  onChange: Dispatch<SetStateAction<ReviewEditForm>>;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex gap-4">
        {(["sweetnessScore", "workloadScore"] as const).map((field) => (
          <div key={field} className="flex-1">
            <label className="text-xs font-bold text-slate-600">
              {field === "sweetnessScore" ? "甜度 Sweetness 1-5" : "負擔 Workload 1-5"}
            </label>
            <select
              value={form[field]}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  [field]: Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-md border p-1.5 text-sm"
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <textarea
        className="min-h-[80px] w-full rounded-md border p-2 text-sm"
        value={form.content}
        onChange={(event) =>
          onChange((current) => ({ ...current, content: event.target.value }))
        }
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>取消</Button>
        <Button size="sm" onClick={onSave} className="bg-slate-900">
          <Save size={14} className="mr-2" />
          儲存
        </Button>
      </div>
    </div>
  );
}
