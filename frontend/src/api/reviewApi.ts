import { API_BASE_URL } from "../config/api";

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

  const res = await fetch(`${API_BASE_URL}/courses/${courseID}/reviews?${params}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function getAllReviews(search = "", sortBy = "newest", limit = 20, skip = 0): Promise<Review[]> {
  const params = new URLSearchParams({
    search: search,
    sort_by: sortBy,
    limit: limit.toString(),
    skip: skip.toString(),
  });

  const res = await fetch(`${API_BASE_URL}/reviews?${params}`);
  if (!res.ok) throw new Error("Failed to fetch all reviews");
  return res.json();
}

export async function createReview(data: { 
  authorID: string; 
  courseID: string; 
  content: string; 
  sweetnessScore: number; 
  workloadScore: number;
}): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); 
    throw new Error(errorData.message || "Failed to submit review");
  }
  
  return res.json();
}