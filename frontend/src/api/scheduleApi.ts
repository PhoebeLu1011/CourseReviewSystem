import { apiRequest } from "./apiClient";

export interface ScheduledCourse {
  courseID: string;
  serialNumber: string;
  title: string;
  department: string;
  credits: number;
  professor: string;
  schedule: string;
  location: string;
  days: string[];
  timeSlot: string;
  createdAt?: string;
}

export async function getSchedule(studentId: string): Promise<ScheduledCourse[]> {
  return apiRequest<ScheduledCourse[]>(`/students/${encodeURIComponent(studentId)}/schedule`, {
    auth: true,
  });
}

export async function replaceSchedule(
  studentId: string,
  courses: ScheduledCourse[]
): Promise<ScheduledCourse[]> {
  return apiRequest<ScheduledCourse[]>(`/students/${encodeURIComponent(studentId)}/schedule`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ courses }),
  });
}

export async function addScheduledCourse(
  studentId: string,
  course: ScheduledCourse
): Promise<ScheduledCourse> {
  return apiRequest<ScheduledCourse>(`/students/${encodeURIComponent(studentId)}/schedule`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(course),
  });
}

export async function removeScheduledCourse(
  studentId: string,
  courseId: string
): Promise<void> {
  await apiRequest<{ message: string }>(
    `/students/${encodeURIComponent(studentId)}/schedule/${encodeURIComponent(courseId)}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}
