export interface Bookmark {
    bookmarkId: string;
    userId: string;
    courseId: string;
    createdAt: string;
}

export interface AddBookmarkRequest {
    courseId: string;
}

export interface BookmarkCountResponse {
    count: number;
}

export interface IsBookmarkedResponse {
    isBookmarked: boolean;
}
