export type UserProfileState = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  studentID: string;
  avatar: string;
  bio: string;
  birthday: string;
  interests: string[];
  reviewCount: number;
  replyCount: number;
  applyCount: number;
};

export type ProfileEditForm = {
  name: string;
  bio: string;
  birthday: string;
  interests: string;
};

export type ReviewEditForm = {
  content: string;
  sweetnessScore: number;
  workloadScore: number;
};

export type DiscussionEditForm = {
  title: string;
  content: string;
};

export type FavoriteCourse = {
  courseID: string;
  courseCode?: string;
  title: string;
  department?: string;
  timeAndLocation?: string;
};
