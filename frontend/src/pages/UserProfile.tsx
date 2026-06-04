import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Camera,
  Check,
  Edit2,
  Hash,
  MapPin,
  MessageSquare,
  Save,
  Star,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import { getProfile } from "../api/userApi";
import { getBookmarks } from "../api/bookmarkApi";
import { getCourse } from "../api/courseApi";
import {
  deleteReview,
  getUserReviews,
  updateReview,
  type Review,
} from "../api/reviewApi";
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

import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  getStudentBadges,
  getAchievementScore,
  checkStudentBadges,
} from "../api/achievementApi";
import type { Badge as AchievementBadge } from "../models/Achievement";

type UserProfileState = {
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

type FavoriteCourse = {
  courseID: string;
  courseCode?: string;
  title: string;
  department?: string;
  timeAndLocation?: string;
};

const mockReports = [
  {
    id: "REP-001",
    type: "Review",
    status: "pending",
    reason: "Spam or Advertisement",
    date: "2026-05-20",
  },
];

function parseNTNUSchedule(value?: string) {
  if (!value) {
    return {
      schedule: "尚無時間資料",
      location: "尚無地點資料",
    };
  }

  const parts = value.split(/\s+/).filter(Boolean);

  return {
    schedule: parts[0] || value,
    location: parts.slice(1).join(" ") || "尚無地點資料",
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  return fallback;
}
function getAchievementIcon(category: string) {
  switch (category) {
    case "reviewer":
      return Star;
    case "replier":
      return MessageSquare;
    case "group_participant":
      return Trophy;
    case "contributor":
      return Trophy;
    default:
      return Trophy;
  }
}

function getAchievementCategoryLabel(category: string) {
  switch (category) {
    case "reviewer":
      return "評論成就";
    case "replier":
      return "回覆成就";
    case "group_participant":
      return "找組員成就";
    case "contributor":
      return "平台貢獻";
    default:
      return category;
  }
}
export default function UserProfile() {
  const { user: authUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({
    content: "",
    sweetnessScore: 5,
    workloadScore: 5,
  });

  const [myDiscussions, setMyDiscussions] = useState<Discussion[]>([]);
  const [myReplies, setMyReplies] = useState<Reply[]>([]);
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [editDiscForm, setEditDiscForm] = useState({ title: "", content: "" });
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  const [favoriteCourses, setFavoriteCourses] = useState<FavoriteCourse[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [achievementBadges, setAchievementBadges] = useState<AchievementBadge[]>([]);
  const [achievementScore, setAchievementScore] = useState<number>(0);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);

  const [user, setUser] = useState<UserProfileState>({
    id: authUser?.id || "",
    name: authUser?.name || "Test Student",
    email: authUser?.email || "student@example.com",
    role: authUser?.role || "Student",
    department: authUser?.department || "Computer Science",
    studentID: authUser?.id || "",
    avatar: authUser?.avatar || "",
    bio: authUser?.bio || "No bio provided yet.",
    birthday: authUser?.birthday || "2000-01-01",
    interests: authUser?.interests || [],
    reviewCount: 0,
    replyCount: 0,
    applyCount: 0,
  });

  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio,
    birthday: user.birthday,
    interests: user.interests.join(", "),
  });

  useEffect(() => {
    if (!authUser) return;

    const fetchFullProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data: any = await getProfile(token);

        if (!data?.success) {
          return;
        }

        const profile = data.student || data.user || data;
        const nextUser: UserProfileState = {
          id: authUser.id,
          name: profile.name || authUser.name,
          email: profile.email || authUser.email,
          role: authUser.role || "Student",
          department: profile.department || authUser.department || "",
          studentID: authUser.id,
          avatar: profile.avatar || authUser.avatar || "",
          bio: profile.bio || "No bio provided yet.",
          birthday: profile.birthday || "2000-01-01",
          interests: profile.interests || [],
          reviewCount: profile.reviewCount || 0,
          replyCount: profile.replyCount || 0,
          applyCount: profile.applyCount || 0,
        };

        setUser(nextUser);
        setEditForm({
          name: nextUser.name,
          bio: nextUser.bio === "No bio provided yet." ? "" : nextUser.bio,
          birthday: nextUser.birthday,
          interests: nextUser.interests.join(", "),
        });
      } catch (err) {
        console.error("Failed to load backend profile data:", err);
        setErrorMsg("個人資料載入失敗，請稍後再試。");
      }
    };

    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const reviews = await getUserReviews(authUser.id);
        setMyReviews(reviews);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    const fetchCommunityData = async () => {
      try {
        const [discussions, replies] = await Promise.all([
          getUserDiscussions(authUser.id),
          getUserReplies(authUser.id),
        ]);
        setMyDiscussions(discussions);
        setMyReplies(replies);
      } catch (err) {
        console.error("Failed to fetch community data:", err);
      }
    };

    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const bookmarks = await getBookmarks(authUser.id);
        const courses = await Promise.all(
          bookmarks.map((bookmark: any) =>
            getCourse(bookmark.courseId || bookmark.courseID).catch(() => null),
          ),
        );
        setFavoriteCourses(courses.filter(Boolean) as FavoriteCourse[]);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setFavoritesLoading(false);
      }
    };

    const fetchAchievements = async () => {
      setIsLoadingAchievements(true);

      try {
        // 先讓後端重新檢查一次目前是否有新 badge
        await checkStudentBadges(authUser.id).catch((err) => {
          console.warn("Failed to check badges:", err);
        });

        const [badgeResult, scoreResult] = await Promise.all([
          getStudentBadges(authUser.id),
          getAchievementScore(authUser.id),
        ]);

        setAchievementBadges(badgeResult.badges || []);
        setAchievementScore(scoreResult.achievementScore || 0);

        setUser((prev) => ({
          ...prev,
          reviewCount: scoreResult.reviewCount ?? prev.reviewCount,
          replyCount: scoreResult.replyCount ?? prev.replyCount,
          applyCount: scoreResult.applyCount ?? prev.applyCount,
        }));
      } catch (err) {
        console.error("Failed to load achievements:", err);
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    fetchFullProfile();
    fetchReviews();
    fetchCommunityData();
    fetchFavorites();
    fetchAchievements();
  }, [authUser]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      bio: user.bio === "No bio provided yet." ? "" : user.bio,
      birthday: user.birthday,
      interests: user.interests.join(", "),
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("圖片大小不能超過 2MB");
      e.target.value = "";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("請先重新登入");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "大頭貼上傳失敗");
        return;
      }

      setUser((prev) => ({ ...prev, avatar: data.avatar_id }));

      if (authUser) {
        const updatedUser = { ...authUser, avatar: data.avatar_id };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      alert("大頭貼上傳成功！重新整理後右上角也會同步更新。");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert("網路錯誤，大頭貼上傳失敗");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!authUser) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("請先重新登入");
      return;
    }

    const interests = editForm.interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${authUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          birthday: editForm.birthday,
          interests,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Update failed");
        return;
      }

      setUser((prevUser) => ({
        ...prevUser,
        name: editForm.name,
        bio: editForm.bio || "No bio provided yet.",
        birthday: editForm.birthday,
        interests,
      }));

      setIsEditing(false);
      alert("個人資料更新成功！");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("網路連線錯誤，修改失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewID: string) => {
    if (!authUser) return;
    if (!window.confirm("確定要刪除這則評論嗎？")) return;

    try {
      await deleteReview(reviewID, authUser.id);
      setMyReviews((prev) => prev.filter((review) => review.reviewID !== reviewID));
      setUser((prev) => ({
        ...prev,
        reviewCount: Math.max(0, prev.reviewCount - 1),
      }));
    } catch (err) {
      alert(getErrorMessage(err, "刪除評論失敗"));
    }
  };

  const handleUpdateReview = async (reviewID: string) => {
    if (!authUser) return;

    try {
      const updatedReview = await updateReview(reviewID, {
        authorID: authUser.id,
        content: editReviewForm.content,
        sweetnessScore: editReviewForm.sweetnessScore,
        workloadScore: editReviewForm.workloadScore,
      });

      setMyReviews((prev) =>
        prev.map((review) => (review.reviewID === reviewID ? updatedReview : review)),
      );
      setEditingReviewId(null);
    } catch (err) {
      alert(getErrorMessage(err, "更新評論失敗"));
    }
  };

  const handleUpdateDisc = async (discussionID: string) => {
    if (!authUser) return;

    try {
      const updatedDiscussion = await updateDiscussion(
        discussionID,
        authUser.id,
        editDiscForm.title,
        editDiscForm.content,
      );

      setMyDiscussions((prev) =>
        prev.map((discussion) =>
          discussion.discussionID === discussionID ? updatedDiscussion : discussion,
        ),
      );
      setEditingDiscId(null);
    } catch (err) {
      alert(getErrorMessage(err, "更新貼文失敗"));
    }
  };

  const handleDeleteDisc = async (discussionID: string) => {
    if (!authUser) return;
    if (!window.confirm("確定要刪除這篇討論嗎？相關回覆也可能會被刪除。")) return;

    try {
      await deleteDiscussion(discussionID, authUser.id);
      setMyDiscussions((prev) =>
        prev.filter((discussion) => discussion.discussionID !== discussionID),
      );
    } catch (err) {
      alert(getErrorMessage(err, "刪除貼文失敗"));
    }
  };

  const handleUpdateReply = async (replyID: string) => {
    if (!authUser) return;

    try {
      const updatedReply = await updateReply(replyID, authUser.id, editReplyContent);
      setMyReplies((prev) =>
        prev.map((reply) => (reply.replyID === replyID ? updatedReply : reply)),
      );
      setEditingReplyId(null);
    } catch (err) {
      alert(getErrorMessage(err, "更新回覆失敗"));
    }
  };

  const handleDeleteReply = async (replyID: string) => {
    if (!authUser) return;
    if (!window.confirm("確定要刪除這則回覆嗎？")) return;

    try {
      await deleteReply(replyID, authUser.id);
      setMyReplies((prev) => prev.filter((reply) => reply.replyID !== replyID));
      setUser((prev) => ({
        ...prev,
        replyCount: Math.max(0, prev.replyCount - 1),
      }));
    } catch (err) {
      alert(getErrorMessage(err, "刪除回覆失敗"));
    }
  };

  if (!authUser) {
    return (
      <Card className="border-dashed border-2 border-slate-200 shadow-none">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">請先登入</h2>
          <p className="mt-2 text-sm text-slate-500">登入後才能查看個人資料。</p>
          <Button asChild className="mt-4">
            <Link to="/login">前往登入</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-sm">
        <div className="absolute left-0 top-0 h-28 w-full bg-gradient-to-r from-primary/10 to-transparent" />
        <CardContent className="relative z-10 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-gradient-to-tr from-rose-500 to-amber-400 shadow-md">
              {user.avatar ? (
                <img
                  src={`${API_BASE_URL}/api/user/avatar/${user.avatar}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full select-none items-center justify-center text-4xl font-black text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isLoading}
                onChange={handleAvatarChange}
              />

              {isEditing && (
                <button
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white transition-opacity duration-200"
                  title="Upload photo"
                  type="button"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={20} />
                  <span className="mt-0.5 text-[10px] font-bold">換照片</span>
                </button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                  )}

                  <p className="mt-2 flex items-center gap-2 font-medium text-muted-foreground">
                    <BookOpen size={16} />
                    {user.role === "Admin" ? "管理員" : "學生"} · {user.department}
                  </p>

                  <p className="mt-1 text-sm font-mono text-muted-foreground">
                    {user.email} · {user.studentID}
                  </p>
                </div>

                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit2 size={16} />
                    編輯個人資料
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancelEdit}
                      variant="ghost"
                      className="gap-2 font-bold text-muted-foreground"
                      disabled={isLoading}
                    >
                      <X size={16} />
                      取消
                    </Button>

                    <Button
                      onClick={handleSave}
                      className="gap-2 bg-slate-900 font-bold hover:bg-slate-800"
                      disabled={isLoading}
                    >
                      <Check size={16} />
                      {isLoading ? "儲存中..." : "儲存"}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="grid gap-4 rounded-xl border bg-slate-50/50 p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-slate-700">
                      個人簡介
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="min-h-[90px] w-full resize-none rounded-xl border border-slate-300 bg-background p-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Calendar size={14} />
                      生日
                    </label>
                    <Input
                      type="date"
                      value={editForm.birthday}
                      className="rounded-xl"
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, birthday: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Hash size={14} />
                      興趣
                    </label>
                    <Input
                      value={editForm.interests}
                      className="rounded-xl"
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, interests: e.target.value }))
                      }
                      placeholder="例如：Coding, Reading, Sports"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="max-w-3xl font-medium leading-relaxed text-slate-600">
                    {user.bio || "尚未填寫個人簡介。"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {user.interests.length > 0 ? (
                      user.interests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-700"
                        >
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs italic text-slate-400">尚未新增興趣。</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">評論數</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {user.reviewCount || myReviews.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">回覆數</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {user.replyCount || myReplies.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">申請數</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{user.applyCount}</p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap rounded-xl bg-slate-100 p-1">
          <TabsTrigger
            value="favorites"
            className="min-w-[120px] flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            我的收藏
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="min-w-[120px] flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            我的評論
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="min-w-[120px] flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            我的貼文
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="min-w-[120px] flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            成就
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="min-w-[120px] flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            我的檢舉
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoritesLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">載入中...</p>
          ) : favoriteCourses.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">尚無收藏課程</h2>
                <p className="mt-2 text-sm text-slate-500">
                  前往{" "}
                  <Link to="/courses" className="font-medium text-primary hover:underline">
                    課程總覽
                  </Link>{" "}
                  收藏你感興趣的課程。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {favoriteCourses.map((course) => {
                const parsed = parseNTNUSchedule(course.timeAndLocation);

                return (
                  <Link key={course.courseID} to={`/courses/${course.courseID}`}>
                    <Card className="border-slate-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="space-y-2 p-5">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {course.courseCode || course.courseID}
                          </p>
                          <h3 className="mt-0.5 text-base font-bold leading-snug text-slate-900">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {course.department || "尚無開課單位"}
                        </p>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {parsed.schedule}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            {parsed.location}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-4">
          {isLoadingReviews ? (
            <p className="text-sm text-slate-500">載入評論中...</p>
          ) : myReviews.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">尚無評論</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  你發表過的課程評論會顯示在這裡。
                </p>
              </CardContent>
            </Card>
          ) : (
            myReviews.map((review) => {
              const isEditingReview = editingReviewId === review.reviewID;
              const dateStr = review.timestamp
                ? new Date(review.timestamp).toLocaleDateString()
                : "尚無日期";

              return (
                <Card key={review.reviewID} className="border-slate-100 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {review.courseName?.split("<")[0] || `Course ID: ${review.courseID}`}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">{dateStr}</p>
                      </div>

                      {!isEditingReview && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(review.reviewID);
                              setEditReviewForm({
                                content: review.content,
                                sweetnessScore: review.sweetnessScore,
                                workloadScore: review.workloadScore,
                              });
                            }}
                            className="p-1.5 text-slate-400 transition-colors hover:text-slate-700"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.reviewID)}
                            className="p-1.5 text-slate-400 transition-colors hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingReview ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-xs font-bold text-slate-600">
                              甜度 Sweetness 1-5
                            </label>
                            <select
                              value={editReviewForm.sweetnessScore}
                              onChange={(e) =>
                                setEditReviewForm((prev) => ({
                                  ...prev,
                                  sweetnessScore: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full rounded-md border p-1.5 text-sm"
                            >
                              {[1, 2, 3, 4, 5].map((score) => (
                                <option key={score} value={score}>
                                  {score}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1">
                            <label className="text-xs font-bold text-slate-600">
                              負擔 Workload 1-5
                            </label>
                            <select
                              value={editReviewForm.workloadScore}
                              onChange={(e) =>
                                setEditReviewForm((prev) => ({
                                  ...prev,
                                  workloadScore: Number(e.target.value),
                                }))
                              }
                              className="mt-1 w-full rounded-md border p-1.5 text-sm"
                            >
                              {[1, 2, 3, 4, 5].map((score) => (
                                <option key={score} value={score}>
                                  {score}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <textarea
                          className="min-h-[80px] w-full rounded-md border p-2 text-sm"
                          value={editReviewForm.content}
                          onChange={(e) =>
                            setEditReviewForm((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                        />

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingReviewId(null)}
                          >
                            取消
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReview(review.reviewID)}
                            className="bg-slate-900"
                          >
                            <Save size={14} className="mr-2" />
                            儲存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 flex gap-4">
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-600"
                          >
                            Sweetness: {review.sweetnessScore}/5
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-blue-600"
                          >
                            Workload: {review.workloadScore}/5
                          </Badge>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                          {review.content}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="posts" className="mt-6 space-y-8">
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 border-b pb-2 text-xl font-bold text-slate-800">
              <MessageSquare size={20} />
              我的討論
            </h2>

            {myDiscussions.length === 0 ? (
              <p className="text-sm italic text-slate-500">尚未發表討論。</p>
            ) : (
              myDiscussions.map((discussion) => (
                <Card key={discussion.discussionID} className="border-slate-100 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        {editingDiscId === discussion.discussionID ? (
                          <Input
                            value={editDiscForm.title}
                            onChange={(e) =>
                              setEditDiscForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className="mb-2 text-lg font-bold"
                          />
                        ) : (
                          <h3 className="text-lg font-bold text-slate-900">
                            {discussion.title}
                          </h3>
                        )}
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Course: {discussion.courseID} ·{" "}
                          {discussion.timestamp
                            ? new Date(discussion.timestamp).toLocaleDateString()
                            : "尚無日期"}
                        </p>
                      </div>

                      {editingDiscId !== discussion.discussionID && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDiscId(discussion.discussionID);
                              setEditDiscForm({
                                title: discussion.title,
                                content: discussion.content,
                              });
                            }}
                            className="p-1.5 text-slate-400 transition-colors hover:text-slate-700"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDisc(discussion.discussionID)}
                            className="p-1.5 text-slate-400 transition-colors hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingDiscId === discussion.discussionID ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <textarea
                          className="min-h-[80px] w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={editDiscForm.content}
                          onChange={(e) =>
                            setEditDiscForm((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                        />
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDiscId(null)}
                          >
                            取消
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateDisc(discussion.discussionID)}
                            className="bg-slate-900"
                          >
                            <Save size={14} className="mr-2" />
                            儲存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {discussion.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h2 className="border-b pb-2 text-xl font-bold text-slate-800">我的回覆</h2>

            {myReplies.length === 0 ? (
              <p className="text-sm italic text-slate-500">尚未發表回覆。</p>
            ) : (
              myReplies.map((reply) => (
                <Card key={reply.replyID} className="border-slate-100 bg-slate-50/50 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-medium text-slate-500">
                        Replied on{" "}
                        {reply.timestamp
                          ? new Date(reply.timestamp).toLocaleDateString()
                          : "尚無日期"}
                      </p>

                      {editingReplyId !== reply.replyID && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyId(reply.replyID);
                              setEditReplyContent(reply.content);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(reply.replyID)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingReplyId === reply.replyID ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                        <textarea
                          className="min-h-[60px] w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={editReplyContent}
                          onChange={(e) => setEditReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingReplyId(null)}
                          >
                            取消
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReply(reply.replyID)}
                            className="bg-slate-900"
                          >
                            <Save size={14} className="mr-2" />
                            儲存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {reply.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="mb-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Achievement Score</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {achievementScore}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              根據評論數、回覆數與找組員申請數計算。
            </p>
          </div>

          {isLoadingAchievements ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              載入成就中...
            </p>
          ) : achievementBadges.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <h2 className="text-xl font-bold text-slate-800">尚未獲得成就</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  發表評論、參與討論或申請加入小組後，成就會顯示在這裡。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {achievementBadges.map((badge) => {
                const Icon = getAchievementIcon(badge.category);

                return (
                  <Card key={badge.badgeID} className="border-slate-100 shadow-sm">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                        <Icon size={24} />
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {badge.badgeName}
                        </h3>

                        <Badge
                          variant="outline"
                          className="rounded-full border-rose-200 text-rose-700"
                        >
                          Lv. {badge.level}
                        </Badge>
                      </div>

                      <p className="text-xs font-bold text-slate-400">
                        {getAchievementCategoryLabel(badge.category)}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {badge.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="space-y-4">
            {mockReports.map((report) => (
              <Card key={report.id} className="border-slate-100 shadow-sm">
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{report.reason}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Case {report.id} · {report.type}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">
                        Submitted on {report.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-lg border-amber-200 bg-amber-50/30 font-bold capitalize text-amber-800"
                  >
                    {report.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
