import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext"; 

const mockAchievements = [
  {
    id: "1",
    title: "Top Reviewer",
    description: "Wrote several helpful course reviews.",
    icon: Star,
  },
  {
    id: "2",
    title: "Community Contributor",
    description: "Participated in discussions and group applications.",
    icon: Trophy,
  },
];

const mockReports = [
  {
    id: "REP-001",
    type: "Review",
    status: "pending",
    reason: "Spam or Advertisement",
    date: "2026-05-20",
  },
  {
    id: "REP-002",
    type: "Discussion",
    status: "resolved",
    reason: "Harassment or Bullying",
    date: "2026-05-10",
  },
];

export default function UserProfile() {
  const { user: authUser, login } = useAuth(); // 🔄 引入全域狀態與 login (用來刷新 Context 用)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. 初始化狀態：如果 Context 裡有真實資料就用真實的，沒有才用 Mock 兜底
  const [user, setUser] = useState({
    id: authUser?.id || "S001",
    name: authUser?.name || "Test Student",
    email: authUser?.email || "student@example.com",
    role: authUser?.role || "Student",
    department: authUser?.department || "Computer Science",
    studentID: authUser?.id || "41271122H",
    avatar: authUser?.avatar || "", // 🎯 改為與後端一致的 avatar (存放 GridFS id)
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
          const profile = data.student || data.user || data;

          setUser({
            id: authUser.id,
            name: profile.name || authUser.name,
            email: authUser.email || profile.email,
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

    if (authUser) {
      fetchFullProfile();
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
  const handleSave = async () => {
    if (!authUser) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/user/${authUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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

        alert("個人檔案修改成功！");
        setIsEditing(false); 
      } else {
        alert(data.message || "修改失敗");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("網路連線錯誤，修改失敗");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

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
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                  )}

                  <p className="mt-2 flex items-center gap-2 text-muted-foreground font-medium">
                    <BookOpen size={16} />
                    {user.role} Account · {user.department}
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
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: user.name,
                          bio: user.bio,
                          birthday: user.birthday,
                          interests: user.interests.join(", "),
                        });
                      }}
                      variant="ghost"
                      className="gap-2 text-muted-foreground font-bold"
                      disabled={isLoading}
                    >
                      <X size={16} />
                      Cancel
                    </Button>

                    <Button 
                      onClick={handleSave} 
                      className="gap-2 bg-slate-900 hover:bg-slate-800 font-bold"
                      disabled={isLoading}
                    >
                      <Check size={16} />
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="grid gap-4 rounded-xl border bg-slate-50/50 p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-slate-700">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      className="min-h-[90px] w-full resize-none rounded-xl border border-slate-300 bg-background p-3 text-sm font-medium outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Calendar size={14} />
                      Birthday
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
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Hash size={14} />
                      Interests
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
                    {user.bio || "No bio provided yet."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {user.interests.length > 0 ? (
                      user.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-slate-100 text-slate-700 font-bold rounded-lg px-2.5 py-1">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No interests added.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 數據統計區塊 */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">Reviews</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{user.reviewCount}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">Replies</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{user.replyCount}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500">Applications</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{user.applyCount}</p>
          </CardContent>
        </Card>
      </section>

      {/* 頁籤內容區塊 */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-[600px] grid-cols-3 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="favorites" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">My Favorites</TabsTrigger>
          <TabsTrigger value="achievements" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">Achievements</TabsTrigger>
          <TabsTrigger value="reports" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          <Card className="border-dashed border-2 border-slate-200 shadow-none">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-slate-800">Saved Courses</h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Favorite course cards will be shown here later.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mockAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.id} className="border-slate-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {achievement.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
                      <p className="mt-1 text-sm text-slate-500 font-medium">
                        Case {report.id} · {report.type}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Submitted on {report.date}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="capitalize rounded-lg font-bold bg-amber-50/30 text-amber-800 border-amber-200">
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