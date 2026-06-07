import { apiRequest } from "./apiClient";

export interface Discussion {
  discussionID: string;
  authorID: string;
  courseID: string;
  title: string;
  content: string;
  likedBy: string[];
  likeCount: number;
  replyCount: number;
  timestamp: string;
}

export interface Reply {
  replyID: string;
  discussionID: string;
  authorID: string;
  content: string;
  likedBy: string[];
  likeCount: number;
  timestamp: string;
}

export async function getCourseDiscussions(courseID: string): Promise<Discussion[]> {
  return apiRequest<Discussion[]>(`/courses/${courseID}/discussions`, {
    includeContentType: false,
  });
}

export async function createDiscussion(data: { courseID: string; title: string; content: string }): Promise<Discussion> {
  return apiRequest<Discussion>("/discussions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function getDiscussionReplies(discussionID: string): Promise<Reply[]> {
  return apiRequest<Reply[]>(`/discussions/${discussionID}/replies`, {
    includeContentType: false,
  });
}

export async function createReply(discussionID: string, data: { content: string }): Promise<Reply> {
  return apiRequest<Reply>(`/discussions/${discussionID}/replies`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function toggleLikeDiscussion(discussionID: string): Promise<{ likeCount: number }> {
  return apiRequest<{ likeCount: number }>(`/discussions/${discussionID}/like`, {
    method: "POST",
    auth: true,
  });
}

export async function toggleLikeReply(replyID: string): Promise<{ likeCount: number }> {
  return apiRequest<{ likeCount: number }>(`/replies/${replyID}/like`, {
    method: "POST",
    auth: true,
  });
}

export async function getAllDiscussions(search = ""): Promise<Discussion[]> {
  const params = new URLSearchParams({ search });
  return apiRequest<Discussion[]>(`/discussions?${params}`, {
    includeContentType: false,
  });
}

export async function getDiscussionByID(discussionID: string): Promise<Discussion> {
  return apiRequest<Discussion>(`/discussions/${discussionID}`, {
    includeContentType: false,
  });
}

export async function getUserDiscussions(studentID: string): Promise<Discussion[]> {
  return apiRequest<Discussion[]>(`/users/${studentID}/discussions`, {
    includeContentType: false,
  });
}

export async function updateDiscussion(discussionID: string, title: string, content: string): Promise<Discussion> {
  return apiRequest<Discussion>(`/discussions/${discussionID}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ title, content }),
  });
}

export async function deleteDiscussion(discussionID: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/discussions/${discussionID}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getUserReplies(studentID: string): Promise<Reply[]> {
  return apiRequest<Reply[]>(`/users/${studentID}/replies`, {
    includeContentType: false,
  });
}

export async function updateReply(replyID: string, content: string): Promise<Reply> {
  return apiRequest<Reply>(`/replies/${replyID}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ content }),
  });
}

export async function deleteReply(replyID: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/replies/${replyID}`, {
    method: "DELETE",
    auth: true,
  });
}
