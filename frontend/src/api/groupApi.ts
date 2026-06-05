import { API_BASE_URL } from "../config/api";
import type { Group } from "../models/Group";

export type CreateGroupPayload = {
  group_name: string;
  course_id: string;
  leader_id: string;
  max_members: number;
  needed_members: number;
  recruitment_deadline?: string | null;
  description?: string | null;
  tags?: string[];
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `API request failed: ${path}`);
  }

  return data as T;
}

export async function getRecommendedGroups(studentId?: string) {
  const query = studentId
    ? `?student_id=${encodeURIComponent(studentId)}`
    : "";

  return request<Group[]>(`/groups/recommended${query}`);
}

export async function getRecommendedGroupsByCourse(
  courseId: string,
  studentId?: string
) {
  const query = studentId
    ? `?student_id=${encodeURIComponent(studentId)}`
    : "";

  return request<Group[]>(
    `/courses/${encodeURIComponent(courseId)}/groups/recommended${query}`
  );
}

export async function createGroup(payload: CreateGroupPayload) {
  return request<Group>("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function closeGroup(groupId: string, leaderId: string) {
  return request<Group>(`/groups/${encodeURIComponent(groupId)}/close`, {
    method: "POST",
    body: JSON.stringify({
      leader_id: leaderId,
    }),
  });
}

export async function reopenGroup(groupId: string, leaderId: string) {
  return request<Group>(`/groups/${encodeURIComponent(groupId)}/reopen`, {
    method: "POST",
    body: JSON.stringify({
      leader_id: leaderId,
    }),
  });
}