import type { Group, GroupManagementDashboard } from "../models/Group";
import { apiRequest } from "./apiClient";

export type CreateGroupPayload = {
  group_name: string;
  course_id: string;
  needed_members: number;
  recruitment_deadline?: string | null;
  description?: string | null;
  tags?: string[];
};

export type EditGroupPayload = {
  group_name?: string;
  needed_members?: number;
  recruitment_deadline?: string | null;
  description?: string | null;
  tags?: string[];
};

export async function getRecommendedGroups(studentId?: string) {
  const query = studentId
    ? `?student_id=${encodeURIComponent(studentId)}`
    : "";

  return apiRequest<Group[]>(`/groups/recommended${query}`, { auth: true });
}

export async function getRecommendedGroupsByCourse(
  courseId: string,
  studentId?: string
) {
  const query = studentId
    ? `?student_id=${encodeURIComponent(studentId)}`
    : "";

  return apiRequest<Group[]>(
    `/courses/${encodeURIComponent(courseId)}/groups/recommended${query}`,
    { auth: true }
  );
}

export async function createGroup(payload: CreateGroupPayload) {
  return apiRequest<Group>("/groups", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function closeGroup(groupId: string) {
  return apiRequest<Group>(`/groups/${encodeURIComponent(groupId)}/close`, {
    method: "POST",
    auth: true,
  });
}

export async function reopenGroup(groupId: string) {
  return apiRequest<Group>(`/groups/${encodeURIComponent(groupId)}/reopen`, {
    method: "POST",
    auth: true,
  });
}

export async function getMyGroupDashboard() {
  return apiRequest<GroupManagementDashboard>("/groups/me/dashboard", { auth: true });
}

export async function removeGroupMember(groupId: string, studentId: string) {
  return apiRequest<Group>(
    `/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(studentId)}`,
    { method: "DELETE", auth: true }
  );
}

export async function leaveGroup(groupId: string) {
  return apiRequest<Group>(`/groups/${encodeURIComponent(groupId)}/members/me`, {
    method: "DELETE",
    auth: true,
  });
}

export async function editGroup(groupId: string, payload: EditGroupPayload) {
  return apiRequest<Group>(`/groups/${encodeURIComponent(groupId)}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function transferGroupLeadership(
  groupId: string,
  newLeaderId: string
) {
  return apiRequest<Group>(
    `/groups/${encodeURIComponent(groupId)}/transfer-leadership`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ new_leader_id: newLeaderId }),
    }
  );
}

export async function dissolveGroup(groupId: string) {
  return apiRequest<Group>(`/groups/${encodeURIComponent(groupId)}`, {
    method: "DELETE",
    auth: true,
  });
}
