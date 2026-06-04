import { API_BASE_URL } from "../config/api";

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
  const res = await fetch(`${API_BASE_URL}/courses/${courseID}/discussions`);
  if (!res.ok) throw new Error("Failed to fetch discussions");
  return res.json();
}

export async function createDiscussion(data: { authorID: string; courseID: string; title: string; content: string }): Promise<Discussion> {
  const res = await fetch(`${API_BASE_URL}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getDiscussionReplies(discussionID: string): Promise<Reply[]> {
  const res = await fetch(`${API_BASE_URL}/discussions/${discussionID}/replies`);
  return res.json();
}

export async function createReply(discussionID: string, data: { authorID: string; content: string }): Promise<Reply> {
  const res = await fetch(`${API_BASE_URL}/discussions/${discussionID}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function toggleLikeDiscussion(discussionID: string, studentID: string): Promise<{ likeCount: number }> {
  const res = await fetch(`${API_BASE_URL}/discussions/${discussionID}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentID }),
  });
  return res.json();
}

export async function toggleLikeReply(replyID: string, studentID: string): Promise<{ likeCount: number }> {
  const res = await fetch(`${API_BASE_URL}/replies/${replyID}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentID }),
  });
  return res.json();
}

export async function getAllDiscussions(search = ""): Promise<Discussion[]> {
  const params = new URLSearchParams({ search });
  const res = await fetch(`${API_BASE_URL}/discussions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch all discussions");
  return res.json();
}

export async function getDiscussionByID(discussionID: string): Promise<Discussion> {
  const res = await fetch(`${API_BASE_URL}/discussions/${discussionID}`);
  if (!res.ok) throw new Error("Failed to load thread details");
  return res.json();
}

export async function getUserDiscussions(studentID: string): Promise<Discussion[]> {
  const res = await fetch(`${API_BASE_URL}/users/${studentID}/discussions`);
  return res.json();
}

export async function updateDiscussion(discussionID: string, studentID: string, title: string, content: string): Promise<Discussion> {
  const res = await fetch(`${API_BASE_URL}/discussions/${discussionID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentID, title, content }),
  });
  return res.json();
}

export async function deleteDiscussion(discussionID: string, studentID: string): Promise<void> {
  await fetch(`${API_BASE_URL}/discussions/${discussionID}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentID }),
  });
}

export async function getUserReplies(studentID: string): Promise<Reply[]> {
  const res = await fetch(`${API_BASE_URL}/users/${studentID}/replies`);
  return res.json();
}

export async function updateReply(replyID: string, studentID: string, content: string): Promise<Reply> {
  const res = await fetch(`${API_BASE_URL}/replies/${replyID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentID, content }),
  });
  return res.json();
}

export async function deleteReply(replyID: string, studentID: string): Promise<void> {
  await fetch(`${API_BASE_URL}/replies/${replyID}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentID }),
  });
}