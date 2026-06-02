export type GroupStatusFilter = "all" | "open" | "closed";
export type AvailabilityFilter = "all" | "available" | "full";

export interface CourseOption {
  id: string;
  code: string;
  name: string;
}

export interface CourseDetail {
  courseID: string;
  title: string;
  serialNumber: string;
  department: string;
  professors: string;
  timeAndLocation: string;
  academicYear: string;
  semester: string;
  syllabusURL: string;
  averageSweetness: number;
  averageWorkload: number;
  reviewCount: number;
}
