import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { LEVELS, SEMESTERS } from "../../api/courseApi";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

interface CourseCatalogFiltersProps {
  query: string;
  department: string;
  level: string;
  semester: string;
  academicYear: string;
  savedOnly: boolean;
  showFilters: boolean;
  departments: string[];
  academicYears: string[];
  onQueryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  onToggleSavedOnly: () => void;
  onToggleFilters: () => void;
}

export function CourseCatalogFilters({
  query,
  department,
  level,
  semester,
  academicYear,
  savedOnly,
  showFilters,
  departments,
  academicYears,
  onQueryChange,
  onDepartmentChange,
  onLevelChange,
  onSemesterChange,
  onAcademicYearChange,
  onToggleSavedOnly,
  onToggleFilters,
}: CourseCatalogFiltersProps) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-6 space-y-5">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-10 h-11 text-base border-slate-100"
            placeholder="搜尋課程名稱、課號、老師..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <button
          onClick={onToggleSavedOnly}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
            savedOnly
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-slate-100 bg-white text-muted-foreground hover:border-slate-200 hover:text-slate-700"
          }`}
        >
          {savedOnly ? (
            <BookmarkCheck size={15} className="text-rose-500" />
          ) : (
            <Bookmark size={15} />
          )}
          已收藏的課程
        </button>

        <button
          onClick={onToggleFilters}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal size={15} />
          進階篩選
        </button>

        {showFilters && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
            <SelectField
              label="開課系所"
              value={department}
              onChange={onDepartmentChange}
              options={departments.map((value) => ({ label: value, value }))}
              emptyLabel="所有系所"
            />
            <SelectField
              label="學制"
              value={level}
              onChange={onLevelChange}
              options={LEVELS.map((value) => ({ label: value, value }))}
              emptyLabel="所有學制"
            />
            <SelectField
              label="學年"
              value={academicYear}
              onChange={onAcademicYearChange}
              options={academicYears.map((value) => ({
                label: `民國 ${value} 年`,
                value,
              }))}
              emptyLabel="所有學年"
            />
            <SelectField
              label="學期"
              value={semester}
              onChange={onSemesterChange}
              options={SEMESTERS}
              emptyLabel="所有學期"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SelectOption {
  label: string;
  value: string;
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
  options: SelectOption[];
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-lg border border-slate-100 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}
