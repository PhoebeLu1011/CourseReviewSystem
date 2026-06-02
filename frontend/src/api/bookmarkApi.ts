import type { Bookmark, AddBookmarkRequest, BookmarkCountResponse, IsBookmarkedResponse } from "../models/Bookmark";

import { API_BASE_URL } from "../config/api";
const BASE_URL = API_BASE_URL;

// 取得某學生的所有收藏
export async function getBookmarks(studentId: string): Promise<Bookmark[]> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/bookmarks`);
    if (!res.ok) throw new Error("Failed to fetch bookmarks");
    return res.json();
}

// 確認是否已收藏某課程
export async function isBookmarked(studentId: string, courseId: string): Promise<IsBookmarkedResponse> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/bookmarks/${courseId}`);
    if (!res.ok) throw new Error("Failed to check bookmark");
    return res.json();
}

// 新增收藏
export async function addBookmark(studentId: string, body: AddBookmarkRequest): Promise<Bookmark> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (res.status === 409) throw new Error("Already bookmarked");
    if (!res.ok) throw new Error("Failed to add bookmark");
    return res.json();
}

// 移除收藏
export async function removeBookmark(studentId: string, courseId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/bookmarks/${courseId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove bookmark");
}

// 取得課程被收藏次數
export async function getBookmarkCount(courseId: string): Promise<BookmarkCountResponse> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/bookmarks/count`);
    if (!res.ok) throw new Error("Failed to fetch bookmark count");
    return res.json();
}
