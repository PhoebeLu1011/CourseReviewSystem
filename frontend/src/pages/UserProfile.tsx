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
} from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { getBookmarks } from "../api/bookmarkApi";
import { getCourse, parseNTNUSchedule, type Course } from "../api/courseApi";

const mockAchievements = [
  {
    id: "1",
    title: "優質評論者",
    description: "撰寫了多篇有幫助的課程評論。",
    icon: Star,
  },
  {
    id: "2",
    title: "社群貢獻者",
    description: "積極參與討論與組員申請。",
    icon: Trophy,
  },
];

const mockReports = [
  {
    id: "REP-001",
    type: "評論",
    status: "pending",
    reason: "垃圾內容或廣告",
    date: "2026-05-20",
  },
  {
    id: "REP-002",
    type: "討論",
    status: "resolved",
    reason: "騷擾或霸凌",
    date: "2026-05-10",
  },
];

export default function UserProfile() {
  const { user: authUser, login } = useAuth();
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
    profilePicURL: "",
    bio: "  ",
    birthday: "2000-01-01",
    interests: [" "],
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
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const profile = data.student || data.user || data;

          setUser({
            id: authUser.id,
            name: profile.name || authUser.name,
            email: authUser.email || profile.email,
            role: authUser.role || "Student",
            department: profile.department || authUser.department,
            studentID: authUser.id,
            profilePicURL: profile.profilePicURL || "",
            bio: profile.bio || "尚未填寫個人簡介。",
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
            
            {}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-gradient-to-tr from-rose-500 to-amber-400 shadow-md">
              {user.profilePicURL ? (
                <img
                  src={user.profilePicURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white select-none">
                  {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
              )}

              {}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    
                    if (file.size > 2 * 1024 * 1024) {
                      alert("Image size should be less than 2MB");
                      return;
                    }
                    
                    const previewURL = URL.createObjectURL(file);
                    setUser((prev) => ({ ...prev, profilePicURL: previewURL }));
                  }
                }}
              />

              {isEditing && (
                <button
                  className="absolute bottom-1 right-1 rounded-full bg-slate-900 p-2 text-white shadow hover:bg-slate-800 transition-colors"
                  title="Upload photo"
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                >
                  <Camera size={16} />
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
                    {user.role === "Admin" ? "管理員" : "學生"} · {user.department}
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
                      取消
                    </Button>

                    <Button 
                      onClick={handleSave} 
                      className="gap-2 bg-slate-900 hover:bg-slate-800 font-bold"
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
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
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
                      placeholder=" "
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
                        <Badge key={interest} variant="secondary" className="bg-slate-100 text-slate-700 font-bold rounded-lg px-2.5 py-1">
                          {interest}
                        </Badge>
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

      {/* 數據統計區塊 */}
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
          )}
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