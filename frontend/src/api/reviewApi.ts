import { apiRequest } from "./apiClient";

export interface Review {
  reviewID: string;
  authorID: string;
  courseID: string;
  courseName?: string;
  content: string;
  sweetnessScore: number;
  workloadScore: number;
  visibilityState: string;
  reportCount: number;
  timestamp: string;
  likedBy: string[];
  likeCount: number;
}

export async function getCourseReviews(courseID: string, sortBy = "newest", limit = 10, skip = 0): Promise<Review[]> {
  const params = new URLSearchParams({
    sort_by: sortBy,
    limit: limit.toString(),
    skip: skip.toString(),
  });

  return apiRequest<Review[]>(`/courses/${courseID}/reviews?${params}`, {
    includeContentType: false,
  });
}

export async function getAllReviews(query = "", sortBy = "newest", department = ""): Promise<Review[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sortBy) params.set("sort_by", sortBy);
  if (department) params.set("department", department);
  
  return apiRequest<Review[]>(`/reviews?${params}`, { includeContentType: false });
}

export async function createReview(data: {
  courseID: string;
  content: string;
  sweetnessScore: number;
  workloadScore: number;
}): Promise<Review> {
  return apiRequest<Review>("/reviews", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function getUserReviews(studentID: string): Promise<Review[]> {
  return apiRequest<Review[]>(`/users/${studentID}/reviews`, {
    includeContentType: false,
  });
}

export async function updateReview(reviewID: string, data: {
  content: string;
  sweetnessScore: number;
  workloadScore: number
}): Promise<Review> {
  return apiRequest<Review>(`/reviews/${reviewID}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function deleteReview(reviewID: string): Promise<void> {
  await apiRequest<{ success?: boolean }>(`/reviews/${reviewID}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function toggleLikeReview(reviewID: string): Promise<{ likeCount: number }> {
  return apiRequest<{ likeCount: number }>(`/reviews/${reviewID}/like`, {
    method: "POST",
    auth: true,
  });
}
