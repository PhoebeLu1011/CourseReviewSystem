import { getProfile } from "../api/userApi";
import { getUserReviews, updateReview, deleteReview, type Review } from "../api/reviewApi"; 
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Calendar,
  Hash,
  Edit2,
  Check,
  X,
  Camera,
  Star,
  Trophy,
  AlertTriangle,
  MapPin,
  Trash2, 
  Save,
  MessageSquare
} from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { 
  getUserDiscussions, getUserReplies, 
  updateDiscussion, deleteDiscussion, 
  updateReply, deleteReply, 
  type Discussion, type Reply 
} from "../api/discussionApi";

const mockAchievements = [
  { id: "1", title: "Top Reviewer", description: "Wrote several helpful course reviews.", icon: Star },
  { id: "2", title: "Community Contributor", description: "Participated in discussions and group applications.", icon: Trophy },
];

const mockReports = [
  { id: "REP-001", type: "Review", status: "pending", reason: "Spam or Advertisement", date: "2026-05-20" },
];

export default function UserProfile() {
  const { user: authUser, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({ content: "", sweetnessScore: 5, workloadScore: 5 });

  const [myDiscussions, setMyDiscussions] = useState<Discussion[]>([]);
  const [myReplies, setMyReplies] = useState<Reply[]>([]);
  
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [editDiscForm, setEditDiscForm] = useState({ title: "", content: "" });
  
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  const [user, setUser] = useState({
    id: authUser?.id || "S001",
    name: authUser?.name || "Test Student",
    email: authUser?.email || "student@example.com",
    role: authUser?.role || "Student",
    department: authUser?.department || "Computer Science",
    studentID: authUser?.id || "41271122H",
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

  // 2. 獲取後端最新 Profile 資料
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  
  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!authUser) return; 
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:5000/api/user/profile", {
          method: "GET",
          headers: {
            // 💡 修正：依據後端程式碼，組長的 request.headers.get("Authorization") 通常要帶 Bearer
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log("=== ⚠️ 後端吐給前端的真實物件結構 ⚠️ ===");
        console.log(JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
        const data: any = await getProfile(token);
        if (data && data.success) {
          const profile = data.student || data.user || data;
          setUser({
            id: authUser.id,
            name: profile.name || authUser.name,
            email: profile.email || authUser.email,
            role: authUser.role || "Student",
            department: profile.department || authUser.department,
            studentID: authUser.id,
            avatar: profile.avatar || "", // 🎯 取得 GridFS 圖片 ID
            bio: profile.bio || "No bio provided yet.",
            birthday: profile.birthday || "2000-01-01",
            interests: profile.interests || [],
            reviewCount: profile.reviewCount || 0,
            replyCount: profile.replyCount || 0,
            applyCount: profile.applyCount || 0,
          });

          setEditForm({
            name: profile.name || authUser.name,
            bio: profile.bio || "",
            birthday: profile.birthday || "2000-01-01",
            interests: (profile.interests || []).join(", "),
          });
        }
      } catch (err) {
        console.error("Failed to load backend profile data:", err);
      }
    };

    const fetchReviews = async () => {
      if (!authUser) return;
      setIsLoadingReviews(true);
      try {
        const reviews = await getUserReviews(authUser.id);
        setMyReviews(reviews);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    // 💡 NEW: Fetch Discussions and Replies
    const fetchCommunityData = async () => {
      if (!authUser) return;
      try {
        const [discs, reps] = await Promise.all([
          getUserDiscussions(authUser.id),
          getUserReplies(authUser.id)
        ]);
        setMyDiscussions(discs);
        setMyReplies(reps);
      } catch (err) {
        console.error("Failed to fetch community data");
      }
    };

    if (authUser) {
      fetchFullProfile();
      fetchReviews(); 
      fetchCommunityData(); // 💡 Called here
    }
  }, [authUser]);

  // 3. 🎯 核心功能：處理大頭貼檔案選擇與「即時」GridFS 上傳
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制 2MB 大小
    if (file.size > 2 * 1024 * 1024) {
      alert("圖片大小不能超過 2MB");
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
      // 📦 包裝成 FormData 格式送給後端
      const formData = new FormData();
      formData.append("avatar", file); // 🎯 key值 "avatar" 必須和後端對應

      const response = await fetch("http://127.0.0.1:5000/api/user/avatar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` // 帶上權限認證
        },
        body: formData // 不要手動寫 Content-Type，讓瀏覽器自動配置
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 更新當前頁面 State
        setUser((prev) => ({ ...prev, avatar: data.avatar_id }));
        
        // 🔄 同步全域 AuthContext 狀態，讓 Layout.tsx 的右上角大頭貼秒同步改變！
        if (authUser) {
          const updatedUser = { ...authUser, avatar: data.avatar_id };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // 如果 AuthContext 有提供 setUser，可以用 setUser(updatedUser)。
          // 這裡用最保險且文文最愛用的手段：直接觸發頁面刷新，讓 Context 重新加載 localStorage 資料
          window.location.reload(); 
        }

        alert("大頭貼上傳並同步成功！");
      } else {
        alert(data.message || "大頭貼上傳失敗");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert("網路錯誤，大頭貼上傳失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 儲存其他個人檔案文字資料
  // 收藏課程
  useEffect(() => {
    if (!authUser) return;
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const bookmarks = await getBookmarks(authUser.id);
        const courses = await Promise.all(
          bookmarks.map((b: any) => getCourse(b.courseId || b.courseID).catch(() => null))
        );
        setFavoriteCourses(courses.filter(Boolean) as Course[]);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, [authUser]);

  const handleSave = async () => {
    if (!authUser) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/user/${authUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          birthday: editForm.birthday,
          interests: editForm.interests.split(",").map(i => i.trim()).filter(i => i !== "")
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser((prevUser) => ({
          ...prevUser,                        
          name: editForm.name,                
          bio: editForm.bio,                    
          birthday: editForm.birthday,        
          interests: editForm.interests.split(",").map(i => i.trim()).filter(i => i !== "") 
        }));
        alert("Profile updated successfully!");
        setIsEditing(false); 
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("網路連線錯誤，修改失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewID: string) => {
    if (!authUser) return;
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(reviewID, authUser.id);
      setMyReviews(prev => prev.filter(r => r.reviewID !== reviewID));
      setUser(prev => ({ ...prev, reviewCount: Math.max(0, prev.reviewCount - 1) }));
    } catch (err: any) { alert(err.message || "Failed to delete review"); }
  };

  const handleUpdateReview = async (reviewID: string) => {
    if (!authUser) return;
    try {
      const updatedReview = await updateReview(reviewID, {
        authorID: authUser.id,
        content: editReviewForm.content,
        sweetnessScore: editReviewForm.sweetnessScore,
        workloadScore: editReviewForm.workloadScore
      });
      setMyReviews(prev => prev.map(r => r.reviewID === reviewID ? updatedReview : r));
      setEditingReviewId(null);
    } catch (err: any) { alert(err.message || "Failed to update review"); }
  };

  // 💡 NEW: Discussion & Reply CRUD Handlers
  const handleUpdateDisc = async (discID: string) => {
    if (!authUser) return;
    try {
      const updated = await updateDiscussion(discID, authUser.id, editDiscForm.title, editDiscForm.content);
      setMyDiscussions(prev => prev.map(d => d.discussionID === discID ? updated : d));
      setEditingDiscId(null);
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteDisc = async (discID: string) => {
    if (!authUser) return;
    if (!window.confirm("Delete this discussion? All replies will be deleted too.")) return;
    try {
      await deleteDiscussion(discID, authUser.id);
      setMyDiscussions(prev => prev.filter(d => d.discussionID !== discID));
    } catch (err) { alert("Delete failed"); }
  };

  const handleUpdateReply = async (replyID: string) => {
    if (!authUser) return;
    try {
      const updated = await updateReply(replyID, authUser.id, editReplyContent);
      setMyReplies(prev => prev.map(r => r.replyID === replyID ? updated : r));
      setEditingReplyId(null);
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteReply = async (replyID: string) => {
    if (!authUser) return;
    if (!window.confirm("Delete this reply?")) return;
    try {
      await deleteReply(replyID, authUser.id);
      setMyReplies(prev => prev.filter(r => r.replyID !== replyID));
      setUser(prev => ({ ...prev, replyCount: Math.max(0, prev.replyCount - 1) }));
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="space-y-8 pb-12">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* --- Profile Header Card --- */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-sm">
        <div className="absolute left-0 top-0 h-28 w-full bg-gradient-to-r from-primary/10 to-transparent" />
        <CardContent className="relative z-10 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            
            {/* 📸 大頭貼區塊：與後端 GridFS 串接路由連動 */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-gradient-to-tr from-rose-500 to-amber-400 shadow-md">
              {user.avatar ? (
                // 🎯 核心修改：如果後端存在 GridFS 圖片 ID，就指向讀取流 API 網址
                <img
                  src={`http://127.0.0.1:5000/api/user/avatar/${user.avatar}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white select-none">
                  {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
              )}

              {/* 檔案選取隱藏 input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
                onChange={handleAvatarChange} // 🎯 觸發剛寫好的 GridFS 上傳方法
              />

              {/* 只要處於編輯模式，就可以點擊相機圖示更換照片 */}
              {isEditing && (
                <button
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white transition-opacity duration-200"
                  title="Upload photo"
                  type="button"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()} 
                >
                  <Camera size={20} />
                  <span className="text-[10px] mt-0.5 font-bold">換照片</span>
                </button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                  )}
                  <p className="mt-2 flex items-center gap-2 text-muted-foreground font-medium">
                    <BookOpen size={16} />
                    {user.role === "Admin" ? "管理員" : "學生"} · {user.department}
                    <BookOpen size={16} /> {user.role} Account · {user.department}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground font-mono">
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
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ name: user.name, bio: user.bio, birthday: user.birthday, interests: user.interests.join(", ") });
                      }}
                      variant="ghost" className="gap-2 text-muted-foreground font-bold"
                    >
                      <X size={16} />
                      取消
                    </Button>

                    <Button 
                      onClick={handleSave} 
                      className="gap-2 bg-slate-900 hover:bg-slate-800 font-bold"
                      disabled={isLoading}
                    >
                      <Check size={16} />
                      {isLoading ? "儲存中..." : "儲存"}
                      <X size={16} /> Cancel
                    </Button>
                    <Button onClick={handleSave} className="gap-2 bg-slate-900 hover:bg-slate-800 font-bold">
                      <Check size={16} /> Save
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
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="min-h-[90px] w-full resize-none rounded-xl border border-slate-300 bg-background p-3 text-sm font-medium outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-800"
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
                        setEditForm({
                          ...editForm,
                          birthday: e.target.value,
                        })
                      }
                    />
                    <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700"><Calendar size={14} /> Birthday</label>
                    <Input type="date" value={editForm.birthday} className="rounded-xl" onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })} />
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
                        setEditForm({
                          ...editForm,
                          interests: e.target.value,
                        })
                      }
                      placeholder="e.g. Coding, Reading, Sports"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="max-w-3xl leading-relaxed text-slate-600 font-medium">
                    {user.bio || "尚未填寫個人簡介。"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {user.interests.length > 0 ? (
                      user.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-slate-100 text-slate-700 font-bold rounded-lg px-2.5 py-1">{interest}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">尚未新增興趣。</span>
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
            <p className="mt-2 text-3xl font-black text-slate-900">{user.reviewCount}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">回覆數</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{user.replyCount}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">申請數</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{user.applyCount}</p>
          </CardContent>
        </Card>
      </section>

      {/* 頁籤內容區塊 */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-[600px] grid-cols-3 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="favorites" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">我的收藏</TabsTrigger>
          <TabsTrigger value="achievements" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">成就</TabsTrigger>
          <TabsTrigger value="reports" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">我的檢舉</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoritesLoading ? (
            <p className="text-center text-sm text-muted-foreground py-8">載入中...</p>
          ) : favoriteCourses.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">尚無收藏課程</h2>
                <p className="mt-2 text-sm text-slate-500">
                  前往{" "}
                  <Link to="/courses" className="text-primary hover:underline font-medium">
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
                    <Card className="border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <CardContent className="p-5 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">{course.courseCode}</p>
                          <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{course.department}</p>
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
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-5"><p className="text-sm font-bold text-slate-500">Reviews</p><p className="mt-2 text-3xl font-black text-slate-900">{myReviews.length}</p></CardContent></Card>
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-5"><p className="text-sm font-bold text-slate-500">Replies</p><p className="mt-2 text-3xl font-black text-slate-900">{myReplies.length}</p></CardContent></Card>
        <Card className="border-slate-100 shadow-sm"><CardContent className="p-5"><p className="text-sm font-bold text-slate-500">Applications</p><p className="mt-2 text-3xl font-black text-slate-900">{user.applyCount}</p></CardContent></Card>
      </section>

      {/* --- Tabs Section --- */}
      <Tabs defaultValue="posts" className="w-full">
        {/* 💡 UPDATED: Added "My Posts" tab and made flex to fit */}
        <TabsList className="mb-6 flex flex-wrap h-auto w-full bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="favorites" className="flex-1 min-w-[120px] font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">My Favorites</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 min-w-[120px] font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">My Reviews</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1 min-w-[120px] font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">My Posts</TabsTrigger>
          <TabsTrigger value="achievements" className="flex-1 min-w-[120px] font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">Achievements</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 min-w-[120px] font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">My Reports</TabsTrigger>
        </TabsList>

        {/* 💡 NEW: My Posts Tab Content */}
        <TabsContent value="posts" className="mt-6 space-y-8">
          {/* DISCUSSIONS SECTION */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">My Discussions</h2>
            {myDiscussions.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No discussions posted yet.</p>
            ) : myDiscussions.map(disc => (
              <Card key={disc.discussionID} className="border-slate-100 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      {editingDiscId === disc.discussionID ? (
                        <Input 
                          value={editDiscForm.title} 
                          onChange={(e) => setEditDiscForm(prev => ({...prev, title: e.target.value}))} 
                          className="font-bold text-lg mb-2"
                        />
                      ) : (
                        <h3 className="font-bold text-slate-900 text-lg">{disc.title}</h3>
                      )}
                      <p className="text-xs font-medium text-slate-500 mt-1">Course: {disc.courseID} · {new Date(disc.timestamp).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Controls */}
                    {editingDiscId !== disc.discussionID && (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingDiscId(disc.discussionID); setEditDiscForm({ title: disc.title, content: disc.content }); }} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteDisc(disc.discussionID)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>

                  {editingDiscId === disc.discussionID ? (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <textarea 
                        className="w-full min-h-[80px] p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={editDiscForm.content}
                        onChange={(e) => setEditDiscForm(prev => ({...prev, content: e.target.value}))}
                      />
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingDiscId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleUpdateDisc(disc.discussionID)} className="bg-slate-900"><Save size={14} className="mr-2"/> Save</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{disc.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* REPLIES SECTION */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">My Replies</h2>
            {myReplies.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No replies posted yet.</p>
            ) : myReplies.map(reply => (
              <Card key={reply.replyID} className="border-slate-100 shadow-sm bg-slate-50/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-medium text-slate-500">Replied on {new Date(reply.timestamp).toLocaleDateString()}</p>
                    {editingReplyId !== reply.replyID && (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingReplyId(reply.replyID); setEditReplyContent(reply.content); }} className="p-1.5 text-slate-400 hover:text-slate-700"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteReply(reply.replyID)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>

                  {editingReplyId === reply.replyID ? (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <textarea 
                        className="w-full min-h-[60px] p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={editReplyContent}
                        onChange={(e) => setEditReplyContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingReplyId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleUpdateReply(reply.replyID)} className="bg-slate-900"><Save size={14} className="mr-2"/> Save</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-4">
          {isLoadingReviews ? (
            <p className="text-sm text-slate-500">Loading reviews...</p>
          ) : myReviews.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">No Reviews Yet</h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">When you review a course, it will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            myReviews.map(review => {
              const isEditingReview = editingReviewId === review.reviewID;
              const dateStr = new Date(review.timestamp).toLocaleDateString();

              return (
                <Card key={review.reviewID} className="border-slate-100 shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {review.courseName?.split('<')[0] || `Course ID: ${review.courseID}`}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">{dateStr}</p>
                      </div>
                      
                      {!isEditingReview && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingReviewId(review.reviewID);
                              setEditReviewForm({ content: review.content, sweetnessScore: review.sweetnessScore, workloadScore: review.workloadScore });
                            }} 
                            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(review.reviewID)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingReview ? (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-xs font-bold text-slate-600">Sweetness (1-5)</label>
                            <select 
                              value={editReviewForm.sweetnessScore} 
                              onChange={(e) => setEditReviewForm(prev => ({...prev, sweetnessScore: Number(e.target.value)}))}
                              className="mt-1 w-full rounded-md border p-1.5 text-sm"
                            >
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-bold text-slate-600">Workload (1-5)</label>
                            <select 
                              value={editReviewForm.workloadScore} 
                              onChange={(e) => setEditReviewForm(prev => ({...prev, workloadScore: Number(e.target.value)}))}
                              className="mt-1 w-full rounded-md border p-1.5 text-sm"
                            >
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                        </div>
                        <textarea 
                          className="w-full min-h-[80px] p-2 border rounded-md text-sm"
                          value={editReviewForm.content}
                          onChange={(e) => setEditReviewForm(prev => ({...prev, content: e.target.value}))}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleUpdateReview(review.reviewID)} className="bg-slate-900"><Save size={14} className="mr-2"/> Save</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-4 mb-2">
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Sweetness: {review.sweetnessScore}/5</Badge>
                          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Workload: {review.workloadScore}/5</Badge>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{review.content}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card className="border-dashed border-2 border-slate-200 shadow-none"><CardContent className="p-8 text-center"><h2 className="text-xl font-bold text-slate-800">Saved Courses</h2><p className="mt-2 text-sm text-slate-500 font-medium">Favorite course cards will be shown here later.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="achievements" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mockAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.id} className="border-slate-100 shadow-sm"><CardContent className="p-6"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"><Icon size={24} /></div><h3 className="text-lg font-bold text-slate-900">{achievement.title}</h3><p className="mt-1 text-sm text-slate-500 font-medium">{achievement.description}</p></CardContent></Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <div className="space-y-4">
            {mockReports.map((report) => (
              <Card key={report.id} className="border-slate-100 shadow-sm"><CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-50 p-3 text-amber-700"><AlertTriangle size={20} /></div><div><h3 className="font-bold text-slate-900">{report.reason}</h3><p className="mt-1 text-sm text-slate-500 font-medium">Case {report.id} · {report.type}</p><p className="text-xs text-slate-400 font-mono mt-0.5">Submitted on {report.date}</p></div></div><Badge variant="outline" className="capitalize rounded-lg font-bold bg-amber-50/30 text-amber-800 border-amber-200">{report.status}</Badge></CardContent></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}