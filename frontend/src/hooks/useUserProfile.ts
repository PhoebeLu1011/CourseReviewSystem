import { useEffect, useRef, useState } from "react";

import {
  deleteDiscussion,
  deleteReply,
  getUserDiscussions,
  getUserReplies,
  updateDiscussion,
  updateReply,
  type Discussion,
  type Reply,
} from "../api/discussionApi";
import {
  checkStudentBadges,
  getAchievementScore,
  getStudentBadges,
} from "../api/achievementApi";
import { getBookmarks } from "../api/bookmarkApi";
import { getCourse } from "../api/courseApi";
import { getMyReportContent, getMyReports } from "../api/reportApi";
import {
  deleteReview,
  getUserReviews,
  updateReview,
  type Review,
} from "../api/reviewApi";
import { getProfile, updateProfile, uploadAvatar } from "../api/userApi";
import type { Badge as AchievementBadge } from "../models/Achievement";
import type { Bookmark } from "../models/Bookmark";
import type { Report } from "../models/Report";
import type {
  DiscussionEditForm,
  FavoriteCourse,
  ProfileEditForm,
  ReviewEditForm,
  UserProfileState,
} from "../components/profile/profileTypes";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";

export function useUserProfile() {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewForm, setEditReviewForm] = useState<ReviewEditForm>({
    content: "",
    sweetnessScore: 5,
    workloadScore: 5,
  });
  const [myDiscussions, setMyDiscussions] = useState<Discussion[]>([]);
  const [myReplies, setMyReplies] = useState<Reply[]>([]);
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [editDiscForm, setEditDiscForm] = useState<DiscussionEditForm>({
    title: "",
    content: "",
  });
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [favoriteCourses, setFavoriteCourses] = useState<FavoriteCourse[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [achievementBadges, setAchievementBadges] = useState<AchievementBadge[]>([]);
  const [achievementScore, setAchievementScore] = useState(0);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [myReportsList, setMyReportsList] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportContents, setReportContents] = useState<Record<string, string>>({});

  const [user, setUser] = useState<UserProfileState>(() => initialUser(authUser));
  const [editForm, setEditForm] = useState<ProfileEditForm>(() => profileEditForm(user));

  useEffect(() => {
    if (!authUser) return;
    const currentUser = authUser;

    async function fetchFullProfile() {
      try {
        const data = await getProfile();
        const profile = data?.student || data?.user;
        if (!data?.success || !profile) return;
        const nextUser: UserProfileState = {
          id: currentUser.id,
          name: profile.name || currentUser.name,
          email: profile.email || currentUser.email || "",
          role: currentUser.role || "Student",
          department: profile.department || currentUser.department || "",
          studentID: currentUser.id,
          avatar: profile.avatar || currentUser.avatar || "",
          bio: profile.bio || "尚未填寫個人簡介。",
          birthday: profile.birthday || "2000-01-01",
          interests: profile.interests || [],
          reviewCount: profile.reviewCount || 0,
          replyCount: profile.replyCount || 0,
          applyCount: profile.applyCount || 0,
        };
        setUser(nextUser);
        setEditForm(profileEditForm(nextUser));
      } catch {
        setErrorMsg("個人資料載入失敗，請稍後再試。");
      }
    }

    async function fetchReviews() {
      setIsLoadingReviews(true);
      try {
        setMyReviews(await getUserReviews(currentUser.id));
      } finally {
        setIsLoadingReviews(false);
      }
    }

    async function fetchCommunityData() {
      const [discussions, replies] = await Promise.all([
        getUserDiscussions(currentUser.id),
        getUserReplies(currentUser.id),
      ]);
      setMyDiscussions(discussions);
      setMyReplies(replies);
    }

    async function fetchFavorites() {
      setFavoritesLoading(true);
      try {
        const bookmarks = await getBookmarks(currentUser.id);
        const courses = await Promise.all(
          bookmarks.map((bookmark: Bookmark) =>
            getCourse(bookmark.courseId).catch(() => null),
          ),
        );
        setFavoriteCourses(courses.filter(Boolean) as FavoriteCourse[]);
      } finally {
        setFavoritesLoading(false);
      }
    }

    async function fetchAchievements() {
      setIsLoadingAchievements(true);
      try {
        await checkStudentBadges(currentUser.id).catch(() => undefined);
        const [badgeResult, scoreResult] = await Promise.all([
          getStudentBadges(currentUser.id),
          getAchievementScore(currentUser.id),
        ]);
        setAchievementBadges(badgeResult.badges || []);
        setAchievementScore(scoreResult.achievementScore || 0);
        setUser((current) => ({
          ...current,
          reviewCount: scoreResult.reviewCount ?? current.reviewCount,
          replyCount: scoreResult.replyCount ?? current.replyCount,
          applyCount: scoreResult.applyCount ?? current.applyCount,
        }));
      } finally {
        setIsLoadingAchievements(false);
      }
    }

    async function fetchReports() {
      setReportsLoading(true);
      try {
        const reports = await getMyReports(currentUser.id);
        setMyReportsList(reports);
        const entries = await Promise.all(
          reports.map(async (report) => {
            try {
              const result = await getMyReportContent(report.reportID);
              const content = result.content;
              if (!content) return [report.reportID, ""] as const;
              const preview =
                typeof content.content === "string"
                  ? content.content
                  : typeof content.title === "string"
                    ? content.title
                    : typeof content.description === "string"
                      ? content.description
                      : "";
              return [report.reportID, preview] as const;
            } catch {
              return [report.reportID, ""] as const;
            }
          }),
        );
        setReportContents(Object.fromEntries(entries));
      } finally {
        setReportsLoading(false);
      }
    }

    void Promise.allSettled([
      fetchFullProfile(),
      fetchReviews(),
      fetchCommunityData(),
      fetchFavorites(),
      fetchAchievements(),
      fetchReports(),
    ]);
  }, [authUser]);

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(profileEditForm(user));
  };

  const changeAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("圖片大小不能超過 2MB");
      event.target.value = "";
      return;
    }
    setIsLoading(true);
    try {
      const data = await uploadAvatar(file);
      setUser((current) => ({ ...current, avatar: data.avatar_id }));
      if (authUser) {
        updateAuthUser({ avatar: data.avatar_id });
      }
      alert("大頭貼上傳成功！重新整理後右上角也會同步更新。");
    } catch {
      alert("網路錯誤，大頭貼上傳失敗");
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  const saveProfile = async () => {
    if (!authUser) return;
    const interests = editForm.interests.split(",").map((item) => item.trim()).filter(Boolean);
    setIsLoading(true);
    try {
      await updateProfile(authUser.id, { ...editForm, interests });
      setUser((current) => ({
        ...current,
        name: editForm.name,
        bio: editForm.bio || "尚未填寫個人簡介。",
        birthday: editForm.birthday,
        interests,
      }));
      updateAuthUser({
        name: editForm.name,
        bio: editForm.bio,
        birthday: editForm.birthday,
        interests,
      });
      setIsEditing(false);
      alert("個人資料更新成功！");
    } catch {
      alert("網路連線錯誤，修改失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMyReview = async (reviewId: string) => {
    if (!window.confirm("確定要刪除這則評論嗎？")) return;
    try {
      await deleteReview(reviewId);
      setMyReviews((current) => current.filter((review) => review.reviewID !== reviewId));
      setUser((current) => ({ ...current, reviewCount: Math.max(0, current.reviewCount - 1) }));
    } catch (error) {
      alert(getErrorMessage(error, "刪除評論失敗"));
    }
  };

  const updateMyReview = async (reviewId: string) => {
    try {
      const updated = await updateReview(reviewId, editReviewForm);
      setMyReviews((current) =>
        current.map((review) => (review.reviewID === reviewId ? updated : review)),
      );
      setEditingReviewId(null);
    } catch (error) {
      alert(getErrorMessage(error, "更新評論失敗"));
    }
  };

  const updateMyDiscussion = async (discussionId: string) => {
    try {
      const updated = await updateDiscussion(
        discussionId,
        editDiscForm.title,
        editDiscForm.content,
      );
      setMyDiscussions((current) =>
        current.map((discussion) =>
          discussion.discussionID === discussionId ? updated : discussion,
        ),
      );
      setEditingDiscId(null);
    } catch (error) {
      alert(getErrorMessage(error, "更新貼文失敗"));
    }
  };

  const deleteMyDiscussion = async (discussionId: string) => {
    if (!window.confirm("確定要刪除這篇討論嗎？相關回覆也可能會被刪除。")) return;
    try {
      await deleteDiscussion(discussionId);
      setMyDiscussions((current) =>
        current.filter((discussion) => discussion.discussionID !== discussionId),
      );
    } catch (error) {
      alert(getErrorMessage(error, "刪除貼文失敗"));
    }
  };

  const updateMyReply = async (replyId: string) => {
    try {
      const updated = await updateReply(replyId, editReplyContent);
      setMyReplies((current) =>
        current.map((reply) => (reply.replyID === replyId ? updated : reply)),
      );
      setEditingReplyId(null);
    } catch (error) {
      alert(getErrorMessage(error, "更新回覆失敗"));
    }
  };

  const deleteMyReply = async (replyId: string) => {
    if (!window.confirm("確定要刪除這則回覆嗎？")) return;
    try {
      await deleteReply(replyId);
      setMyReplies((current) => current.filter((reply) => reply.replyID !== replyId));
      setUser((current) => ({ ...current, replyCount: Math.max(0, current.replyCount - 1) }));
    } catch (error) {
      alert(getErrorMessage(error, "刪除回覆失敗"));
    }
  };

  return {
    authUser, fileInputRef, user, editForm, setEditForm, isEditing, setIsEditing,
    isLoading, errorMsg, cancelEdit, changeAvatar, saveProfile,
    myReviews, isLoadingReviews, editingReviewId, setEditingReviewId,
    editReviewForm, setEditReviewForm, updateMyReview, deleteMyReview,
    myDiscussions, myReplies, editingDiscId, setEditingDiscId, editDiscForm,
    setEditDiscForm, updateMyDiscussion, deleteMyDiscussion, editingReplyId,
    setEditingReplyId, editReplyContent, setEditReplyContent, updateMyReply,
    deleteMyReply, favoriteCourses, favoritesLoading, achievementBadges,
    achievementScore, isLoadingAchievements, myReportsList, reportsLoading,
    reportContents,
  };
}

function initialUser(authUser: ReturnType<typeof useAuth>["user"]): UserProfileState {
  return {
    id: authUser?.id || "",
    name: authUser?.name || "學生",
    email: authUser?.email || "student@example.com",
    role: authUser?.role || "Student",
    department: authUser?.department || "未設定",
    studentID: authUser?.id || "",
    avatar: authUser?.avatar || "",
    bio: authUser?.bio || "尚未填寫個人簡介。",
    birthday: authUser?.birthday || "2000-01-01",
    interests: authUser?.interests || [],
    reviewCount: 0,
    replyCount: 0,
    applyCount: 0,
  };
}

function profileEditForm(user: UserProfileState): ProfileEditForm {
  return {
    name: user.name,
    bio: user.bio === "尚未填寫個人簡介。" ? "" : user.bio,
    birthday: user.birthday,
    interests: user.interests.join(", "),
  };
}
