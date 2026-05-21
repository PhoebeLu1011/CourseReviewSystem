import { useState } from "react";
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

const mockUser = {
  id: "S001",
  name: "Test Student",
  email: "student@example.com",
  role: "Student",
  department: "Computer Science",
  studentID: "41271122H",
  profilePicURL: "",
  bio: "I am interested in software engineering, music technology, and course reviews.",
  birthday: "2003-05-12",
  interests: ["AI", "Web Development", "Music Tech"],
  reviewCount: 8,
  replyCount: 3,
  applyCount: 2,
};

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
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: user.bio,
    birthday: user.birthday,
    interests: user.interests.join(", "),
  });

  const handleSave = () => {
    setUser({
      ...user,
      name: editForm.name,
      bio: editForm.bio,
      birthday: editForm.birthday,
      interests: editForm.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-sm">
        <div className="absolute left-0 top-0 h-28 w-full bg-gradient-to-r from-primary/10 to-transparent" />

        <CardContent className="relative z-10 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-primary/10 shadow-md">
              {user.profilePicURL ? (
                <img
                  src={user.profilePicURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
              )}

              {isEditing && (
                <button
                  className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground shadow"
                  title="Upload photo"
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
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                  )}

                  <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <BookOpen size={16} />
                    {user.role} Account · {user.department}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.email} · {user.studentID}
                  </p>
                </div>

                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      className="gap-2 text-muted-foreground"
                    >
                      <X size={16} />
                      Cancel
                    </Button>

                    <Button onClick={handleSave} className="gap-2">
                      <Check size={16} />
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="grid gap-4 rounded-xl border bg-secondary/30 p-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      className="min-h-[90px] w-full resize-none rounded-md border bg-background p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-semibold">
                      <Calendar size={14} />
                      Birthday
                    </label>
                    <Input
                      type="date"
                      value={editForm.birthday}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          birthday: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-semibold">
                      <Hash size={14} />
                      Interests
                    </label>
                    <Input
                      value={editForm.interests}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          interests: e.target.value,
                        })
                      }
                      placeholder="AI, Web Dev, Music"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="max-w-3xl leading-relaxed text-slate-600">
                    {user.bio || "No bio provided yet."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Reviews</p>
            <p className="mt-2 text-3xl font-bold">{user.reviewCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Replies</p>
            <p className="mt-2 text-3xl font-bold">{user.replyCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Applications</p>
            <p className="mt-2 text-3xl font-bold">{user.applyCount}</p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold">Saved Courses</h2>
              <p className="mt-2 text-muted-foreground">
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
                <Card key={achievement.id}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">
                      {achievement.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
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
              <Card key={report.id}>
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-amber-100 p-3 text-amber-700">
                      <AlertTriangle size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold">{report.reason}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Case {report.id} · {report.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted on {report.date}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="capitalize">
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