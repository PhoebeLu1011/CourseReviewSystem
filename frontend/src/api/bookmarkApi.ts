import type { Bookmark, AddBookmarkRequest, BookmarkCountResponse, IsBookmarkedResponse } from "../models/Bookmark";

import { apiRequest } from "./apiClient";

// 取得某學生的所有收藏
export async function getBookmarks(studentId: string): Promise<Bookmark[]> {
  return apiRequest<Bookmark[]>(`/students/${encodeURIComponent(studentId)}/bookmarks`, {
    auth: true,
    includeContentType: false,
  });
}

// 確認是否已收藏某課程
export async function isBookmarked(studentId: string, courseId: string): Promise<IsBookmarkedResponse> {
  return apiRequest<IsBookmarkedResponse>(
    `/students/${encodeURIComponent(studentId)}/bookmarks/${encodeURIComponent(courseId)}`,
    { auth: true, includeContentType: false }
  );
}

// 新增收藏
export async function addBookmark(studentId: string, body: AddBookmarkRequest): Promise<Bookmark> {
  return apiRequest<Bookmark>(`/students/${encodeURIComponent(studentId)}/bookmarks`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

// 移除收藏
export async function removeBookmark(studentId: string, courseId: string): Promise<void> {
  await apiRequest<{ message: string }>(
    `/students/${encodeURIComponent(studentId)}/bookmarks/${encodeURIComponent(courseId)}`,
    { method: "DELETE", auth: true, includeContentType: false }
  );
}

// 取得課程被收藏次數
export async function getBookmarkCount(courseId: string): Promise<BookmarkCountResponse> {
  return apiRequest<BookmarkCountResponse>(
    `/courses/${encodeURIComponent(courseId)}/bookmarks/count`,
    { includeContentType: false }
  );
}
