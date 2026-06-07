import type { Course } from "../../api/courseApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ALL_COURSES_ID,
  ALL_DEPARTMENTS_ID,
  cleanCourseTitle,
  getCourseDisplayCode,
  meetingPreferenceOptions,
  studyStyleOptions,
} from "./groupmateOptions";

interface GroupFiltersProps {
  departments: string[];
  courseOptions: Course[];
  selectedDepartment: string;
  selectedCourseId: string;
  selectedStudyStyle: string;
  selectedMeetingPreference: string;
  isLoadingDepartments: boolean;
  isLoadingCourses: boolean;
  onDepartmentChange: (department: string) => void;
  onCourseChange: (courseId: string) => void;
  onStudyStyleChange: (style: string) => void;
  onMeetingPreferenceChange: (preference: string) => void;
}

export function GroupFilters({
  departments,
  courseOptions,
  selectedDepartment,
  selectedCourseId,
  selectedStudyStyle,
  selectedMeetingPreference,
  isLoadingDepartments,
  isLoadingCourses,
  onDepartmentChange,
  onCourseChange,
  onStudyStyleChange,
  onMeetingPreferenceChange,
}: GroupFiltersProps) {
  return (
    <aside className="space-y-4 lg:col-span-1">
      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-6">
          <label className="block">
            <span className="mb-5 block text-lg font-semibold text-slate-900">系所</span>
            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
              <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                <SelectValue placeholder="所有系所" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENTS_ID}>所有系所</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingDepartments && <p className="mt-2 text-xs text-slate-400">載入系所中...</p>}
          </label>

          <label className="block">
            <span className="mb-5 block text-lg font-semibold text-slate-900">課程</span>
            <Select
              value={selectedCourseId}
              onValueChange={onCourseChange}
            >
              <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                <SelectValue placeholder="所有課程" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_COURSES_ID}>所有課程</SelectItem>
                {courseOptions.map((course) => (
                  <SelectItem key={course.courseID} value={course.courseID}>
                    {getCourseDisplayCode(course)}: {cleanCourseTitle(course.title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingCourses && <p className="mt-2 text-xs text-slate-400">載入課程中...</p>}
          </label>

          <label className="block">
            <span className="mb-5 block text-lg font-semibold text-slate-900">讀書風格</span>
            <Select value={selectedStudyStyle} onValueChange={onStudyStyleChange}>
              <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                <SelectValue placeholder="所有風格" />
              </SelectTrigger>
              <SelectContent>
                {studyStyleOptions.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="block">
            <span className="mb-5 block text-lg font-semibold text-slate-900">見面偏好</span>
            <Select value={selectedMeetingPreference} onValueChange={onMeetingPreferenceChange}>
              <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                <SelectValue placeholder="所有偏好" />
              </SelectTrigger>
              <SelectContent>
                {meetingPreferenceOptions.map((preference) => (
                  <SelectItem key={preference.value} value={preference.value}>
                    {preference.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-slate-200 bg-white text-sm text-slate-600 shadow-sm">
        <CardContent className="px-5 py-5">
          <div className="mb-3 font-semibold text-slate-900">找組員小技巧</div>
          <ul className="list-inside list-disc space-y-1 leading-relaxed">
            <li>清楚說明你的目標</li>
            <li>標明可配合的時段</li>
            <li>即時回覆訊息</li>
            <li>提前溝通好期望</li>
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}
