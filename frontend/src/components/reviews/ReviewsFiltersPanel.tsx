import { ChevronDown } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { REVIEW_SORT_OPTIONS } from "./reviewOptions";

interface ReviewsFiltersPanelProps {
  selectedCourse: string;
  selectedDepartment: string;
  sortBy: string;
  departments: string[];
  onCourseChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function ReviewsFiltersPanel({
  selectedCourse,
  selectedDepartment,
  sortBy,
  departments,
  onCourseChange,
  onDepartmentChange,
  onSortChange,
}: ReviewsFiltersPanelProps) {
  return (
    <div className="lg:col-span-1 space-y-6 sticky top-6">
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-bold text-slate-800 text-lg">篩選</h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">搜尋課程</label>
            <Input
              className="bg-slate-50/50"
              placeholder="輸入課程 ID 或名稱"
              value={selectedCourse}
              onChange={(event) => onCourseChange(event.target.value)}
            />
          </div>

          <SelectField
            label="開課系所"
            value={selectedDepartment}
            options={departments.map((value) => ({ label: value, value }))}
            emptyLabel="所有系所"
            onChange={onDepartmentChange}
          />

          <div className="pt-2 border-t border-slate-100">
            <SelectField
              label="排序方式"
              value={sortBy}
              options={REVIEW_SORT_OPTIONS}
              emptyLabel="最新優先"
              onChange={onSortChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  emptyLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{emptyLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
