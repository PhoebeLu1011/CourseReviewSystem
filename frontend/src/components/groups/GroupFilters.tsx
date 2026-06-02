import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type {
  AvailabilityFilter,
  CourseOption,
  GroupStatusFilter,
} from "./types";

interface GroupFiltersProps {
  availableTags: string[];
  courses: CourseOption[];
  searchQuery: string;
  selectedCourseId: string;
  selectedCourse?: CourseOption;
  statusFilter: GroupStatusFilter;
  availabilityFilter: AvailabilityFilter;
  tagFilter: string;
  onSearchQueryChange: (value: string) => void;
  onSelectedCourseIdChange: (value: string) => void;
  onStatusFilterChange: (value: GroupStatusFilter) => void;
  onAvailabilityFilterChange: (value: AvailabilityFilter) => void;
  onTagFilterChange: (value: string) => void;
}

export function GroupFilters({
  availableTags,
  courses,
  searchQuery,
  selectedCourseId,
  selectedCourse,
  statusFilter,
  availabilityFilter,
  tagFilter,
  onSearchQueryChange,
  onSelectedCourseIdChange,
  onStatusFilterChange,
  onAvailabilityFilterChange,
  onTagFilterChange,
}: GroupFiltersProps) {
  return (
    <aside className="space-y-4 lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Name, tag, course..."
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Course
            </label>
            <Select
              value={selectedCourseId}
              onValueChange={onSelectedCourseIdChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                onStatusFilterChange(value as GroupStatusFilter)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Seats
            </label>
            <Select
              value={availabilityFilter}
              onValueChange={(value) =>
                onAvailabilityFilterChange(value as AvailabilityFilter)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tag
            </label>
            <Select value={tagFilter} onValueChange={onTagFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-slate-600">
          <div className="font-medium text-slate-900">Current Course</div>
          <div>{selectedCourse?.name ?? selectedCourseId}</div>
          <div className="text-xs text-slate-500">
            Group recommendations are loaded from the backend by course ID.
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
