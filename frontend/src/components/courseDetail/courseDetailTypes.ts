import type { Course as APICourse } from "../../api/courseApi";

export interface CourseView extends APICourse {
  professor: string;
  schedule: string;
  location: string;
  days: string[];
  timeSlot: string;
}
