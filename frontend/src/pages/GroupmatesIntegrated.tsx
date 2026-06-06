import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Mail,
  Plus,
  Send,
  Users,
} from "lucide-react";

import type { Group } from "../models/Group";
import type { Application } from "../models/Application";
import { useAuth } from "../context/AuthContext";
import { getDepartments, searchCourses, type Course } from "../api/courseApi";

import {
  getRecommendedGroups,
  getRecommendedGroupsByCourse,
  createGroup,
  closeGroup,
  reopenGroup,
} from "../api/groupApi";

import {
  getPendingApplications,
  createApplication,
} from "../api/applicationApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { Button } from "../components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

import { Textarea } from "../components/ui/textarea";

const ALL_COURSES_ID = "all";
const ALL_DEPARTMENTS_ID = "all";
const COURSE_OPTION_LIMIT = 100;

const studyStyleOptions = ["All Styles", "Group", "Pair", "Flexible"];
const createStudyStyleOptions = ["Pair", "Group", "Flexible"];

const meetingPreferenceOptions = [
  "All Preferences",
  "Online",
  "In-person",
  "Hybrid",
];

const createMeetingPreferenceOptions = ["Hybrid", "In-person", "Online"];

const dedupeCoursesById = (courses: Course[]) => {
  return Array.from(
    new Map(courses.map((course) => [course.courseID, course])).values()
  );
};

const cleanCourseTitle = (title?: string | null) => {
  return (title || "")
    .split(/<\/?br\s*\/?>/i)[0]
    .trim();
};

export default function GroupmatesIntegrated() {
  const { user } = useAuth();
  console.log("Groupmates user =", user);
  console.log("Groupmates user role =", user?.role);
  console.log("Groupmates user id =", user?.id);
  const [selectedDepartment, setSelectedDepartment] =
    useState(ALL_DEPARTMENTS_ID);
  const [selectedCourseId, setSelectedCourseId] = useState(ALL_COURSES_ID);
  const [selectedStudyStyle, setSelectedStudyStyle] = useState("All Styles");
  const [selectedMeetingPreference, setSelectedMeetingPreference] =
    useState("All Preferences");

  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>(
    []
  );

  const [departments, setDepartments] = useState<string[]>([]);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [createCourseOptions, setCreateCourseOptions] = useState<Course[]>([]);

  const [messageByGroupId, setMessageByGroupId] = useState<
    Record<string, string>
  >({});

  const [notice, setNotice] = useState("");

  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingCreateCourses, setIsLoadingCreateCourses] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSubmittingGroupId, setIsSubmittingGroupId] = useState<string | null>(
    null
  );
  const [isUpdatingGroupId, setIsUpdatingGroupId] = useState<string | null>(
    null
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPostDepartment, setNewPostDepartment] =
    useState(ALL_DEPARTMENTS_ID);
  const [newPostCourse, setNewPostCourse] = useState("");
  const [newPostStyle, setNewPostStyle] = useState("Pair");
  const [newPostMeeting, setNewPostMeeting] = useState("Hybrid");
  const [newPostNeededMembers, setNewPostNeededMembers] = useState("1");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostDeadline, setNewPostDeadline] = useState("");
  const [newPostLookingFor, setNewPostLookingFor] = useState("");
  const [newPostAvailability, setNewPostAvailability] = useState("");
  const [newPostContact, setNewPostContact] = useState("");

  const isStudent = user?.role.toLowerCase() === "student";
  const studentId = isStudent ? user.id : "";

  const hasSelectedDepartment = selectedDepartment !== ALL_DEPARTMENTS_ID;
  const hasSelectedNewPostDepartment =
    newPostDepartment !== ALL_DEPARTMENTS_ID;

  const selectedDepartmentFilter = hasSelectedDepartment
    ? selectedDepartment
    : "";

  const newPostDepartmentFilter = hasSelectedNewPostDepartment
    ? newPostDepartment
    : "";

  const neededMembers = Number(newPostNeededMembers);

  const canCreatePost =
    hasSelectedNewPostDepartment &&
    Boolean(newPostCourse) &&
    Number.isInteger(neededMembers) &&
    neededMembers >= 1 &&
    neededMembers <= 20 &&
    Boolean(newPostDescription.trim()) &&
    Boolean(newPostContact.trim());

  const courseById = useMemo(() => {
    return new Map(
      [...courseOptions, ...createCourseOptions].map((course) => [
        course.courseID,
        course,
      ])
    );
  }, [courseOptions, createCourseOptions]);

  const selectedCourse = courseById.get(selectedCourseId);

  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      setIsLoadingDepartments(true);

      try {
        const result = await getDepartments();

        if (!cancelled) {
          setDepartments(result);
        }
      } catch (error) {
        console.warn("Failed to load departments:", error);

        if (!cancelled) {
          setDepartments([]);
          setNotice("無法載入系所資料，請確認後端與資料庫是否已啟動。");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDepartments(false);
        }
      }
    };

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCourseOptions = async () => {
      if (!hasSelectedDepartment) {
        setCourseOptions([]);
        setIsLoadingCourses(false);
        return;
      }

      setIsLoadingCourses(true);

      try {
        const result = await searchCourses(
          "",
          selectedDepartmentFilter,
          "",
          "",
          "",
          COURSE_OPTION_LIMIT,
          0
        );

        if (!cancelled) {
          setCourseOptions(dedupeCoursesById(result.courses));
        }
      } catch (error) {
        console.warn("Failed to load courses:", error);

        if (!cancelled) {
          setCourseOptions([]);
          setNotice("無法載入課程資料，請確認後端與資料庫是否已啟動。");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCourses(false);
        }
      }
    };

    loadCourseOptions();

    return () => {
      cancelled = true;
    };
  }, [hasSelectedDepartment, selectedDepartmentFilter]);

  useEffect(() => {
    let cancelled = false;

    const loadCreateCourseOptions = async () => {
      if (!hasSelectedNewPostDepartment) {
        setCreateCourseOptions([]);
        setIsLoadingCreateCourses(false);
        return;
      }

      setIsLoadingCreateCourses(true);

      try {
        const result = await searchCourses(
          "",
          newPostDepartmentFilter,
          "",
          "",
          "",
          COURSE_OPTION_LIMIT,
          0
        );

        if (!cancelled) {
          setCreateCourseOptions(dedupeCoursesById(result.courses));
        }
      } catch (error) {
        console.warn("Failed to load create courses:", error);

        if (!cancelled) {
          setCreateCourseOptions([]);
          setNotice("無法載入建立貼文用的課程資料。");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCreateCourses(false);
        }
      }
    };

    loadCreateCourseOptions();

    return () => {
      cancelled = true;
    };
  }, [hasSelectedNewPostDepartment, newPostDepartmentFilter]);
  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    setNotice("");

    try {
      // All Departments：顯示全部可加入的 groups
      if (selectedDepartment === ALL_DEPARTMENTS_ID) {
        const result = await getRecommendedGroups(studentId || undefined);
        console.log("All departments groups =", result);
        setGroups(result);
        return;
      }

      // 有選 Department，但 Course 是 All Courses：顯示該系所有課程底下的 groups
      if (selectedCourseId === ALL_COURSES_ID) {
        const courseIds = courseOptions.map((course) => course.courseID);

        if (courseIds.length === 0) {
          setGroups([]);
          return;
        }

        const responses = await Promise.all(
          courseIds.map((courseId) =>
            getRecommendedGroupsByCourse(courseId, studentId || undefined)
          )
        );

        const uniqueGroups = Array.from(
          new Map(
            responses.flat().map((group) => [group.group_id, group])
          ).values()
        );

        setGroups(uniqueGroups);
        return;
      }

      // 有選特定 Course：只顯示該課程 groups
      const result = await getRecommendedGroupsByCourse(
        selectedCourseId,
        studentId || undefined
      );

      setGroups(result);
    } catch (error) {
      console.warn("Failed to load groups:", error);
      setGroups([]);
      setNotice("無法載入推薦小組，請確認後端與資料庫是否已啟動。");
    } finally {
      setIsLoadingGroups(false);
    }
  }, [selectedDepartment, selectedCourseId, courseOptions, studentId]);
  const loadPendingApplications = useCallback(async () => {
    if (!studentId) {
      setPendingApplications([]);
      return;
    }

    try {
      const result = await getPendingApplications(studentId);
      setPendingApplications(result);
    } catch (error) {
      console.warn("Failed to load pending applications:", error);
      setPendingApplications([]);
    }
  }, [studentId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadPendingApplications();
  }, [loadPendingApplications]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const tags = group.tags.map((tag) => tag.toLowerCase());

      const matchesStyle =
        selectedStudyStyle === "All Styles" ||
        tags.includes(selectedStudyStyle.toLowerCase());

      const matchesMeeting =
        selectedMeetingPreference === "All Preferences" ||
        tags.includes(selectedMeetingPreference.toLowerCase());

      return matchesStyle && matchesMeeting;
    });
  }, [groups, selectedStudyStyle, selectedMeetingPreference]);

  const hasPendingApplication = (groupId: string) => {
    return pendingApplications.some(
      (app) => app.group_id === groupId && app.status === "pending"
    );
  };

  const isGroupFull = (group: Group) => {
    return group.members.length >= group.max_members;
  };

  const getNeededMembers = (group: Group) => {
    return (
      group.needed_members ??
      Math.max(group.max_members - group.members.length, 0)
    );
  };

  const isAlreadyMember = (group: Group) => {
    return Boolean(studentId) && group.members.includes(studentId);
  };

  const isLeader = (group: Group) => {
    return Boolean(studentId) && group.leader_id === studentId;
  };

  const canApply = (group: Group) => {
    return (
      Boolean(studentId) &&
      group.status === "open" &&
      !isGroupFull(group) &&
      !isAlreadyMember(group) &&
      !isLeader(group) &&
      !hasPendingApplication(group.group_id)
    );
  };

  const getButtonLabel = (group: Group) => {
    if (!studentId) return "登入後申請";
    if (isSubmittingGroupId === group.group_id) return "送出中...";
    if (isLeader(group)) return "你是組長";
    if (isAlreadyMember(group)) return "已是成員";
    if (hasPendingApplication(group.group_id)) return "申請中";
    if (isGroupFull(group)) return "已額滿";
    if (group.status !== "open") return "已關閉";
    return "申請加入";
  };

  const resetCreatePostForm = () => {
    setNewPostDepartment(ALL_DEPARTMENTS_ID);
    setNewPostCourse("");
    setNewPostStyle("Pair");
    setNewPostMeeting("Hybrid");
    setNewPostNeededMembers("1");
    setNewPostDeadline("");
    setNewPostDescription("");
    setNewPostLookingFor("");
    setNewPostAvailability("");
    setNewPostContact("");
  };

  const handleSelectedDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setSelectedCourseId(ALL_COURSES_ID);
  };

  const handleNewPostDepartmentChange = (department: string) => {
    setNewPostDepartment(department);
    setNewPostCourse("");
  };

  const handleCreatePost = async () => {
    if (!studentId) {
      setNotice("請先使用學生帳號登入後再建立找組員貼文。");
      setIsCreateDialogOpen(false);
      return;
    }

    if (!canCreatePost) {
      setNotice("請完整填寫課程、需求人數、描述與聯絡方式。");
      return;
    }

    const course = createCourseOptions.find(
      (option) => option.courseID === newPostCourse
    );

    if (!course) {
      setNotice("找不到選擇的課程，請重新選擇。");
      return;
    }

    const lookingForTags = newPostLookingFor
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const descriptionParts = [
      newPostDescription.trim(),
      newPostAvailability.trim()
        ? `Availability: ${newPostAvailability.trim()}`
        : "",
      newPostContact.trim() ? `Contact: ${newPostContact.trim()}` : "",
    ].filter(Boolean);

    setIsCreatingPost(true);
    setNotice("");

    try {
      const newGroup = await createGroup({
        group_name: `${user?.name || "Student"}'s Groupmate Post`,
        course_id: course.courseID,
        leader_id: studentId,
        max_members: neededMembers + 1,
        needed_members: neededMembers,
        recruitment_deadline: newPostDeadline
          ? new Date(newPostDeadline).toISOString()
          : null,
        description: descriptionParts.join("\n"),
        tags: [newPostStyle, newPostMeeting, ...lookingForTags],
      });

      setCourseOptions((prev) =>
        prev.some((option) => option.courseID === course.courseID)
          ? prev
          : [course, ...prev]
      );

      setGroups((prev) => [newGroup, ...prev]);
      setSelectedCourseId(ALL_COURSES_ID);
      setNotice("找組員貼文已建立。");
      setIsCreateDialogOpen(false);
      resetCreatePostForm();
    } catch (error: any) {
      console.warn("Failed to create group:", error);
      setNotice(error.message || "建立找組員貼文失敗，請稍後再試。");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleApply = async (group: Group) => {
    if (!studentId) {
      setNotice("請先使用學生帳號登入後再申請加入小組。");
      return;
    }

    if (!canApply(group)) {
      return;
    }

    const message =
      messageByGroupId[group.group_id]?.trim() ||
      "I would like to join your group.";

    setIsSubmittingGroupId(group.group_id);
    setNotice("");

    try {
      const application = await createApplication({
        student_id: studentId,
        group_id: group.group_id,
        message,
      });

      setPendingApplications((prev) => [...prev, application]);
      setMessageByGroupId((prev) => ({
        ...prev,
        [group.group_id]: "",
      }));

      setNotice("申請已送出！");
    } catch (error: any) {
      console.warn("Failed to apply:", error);
      setNotice(error.message || "申請失敗，請稍後再試。");
    } finally {
      setIsSubmittingGroupId(null);
    }
  };

  const handleToggleRecruitment = async (group: Group) => {
    if (!studentId || group.leader_id !== studentId) {
      return;
    }

    const action = group.status === "open" ? "close" : "reopen";

    setIsUpdatingGroupId(group.group_id);
    setNotice("");

    try {
      const updatedGroup =
        action === "close"
          ? await closeGroup(group.group_id, studentId)
          : await reopenGroup(group.group_id, studentId);

      setGroups((prev) =>
        prev.map((item) =>
          item.group_id === group.group_id ? updatedGroup : item
        )
      );

      setNotice(action === "close" ? "招募已關閉。" : "招募已重新開啟。");
    } catch (error: any) {
      console.warn("Failed to update recruitment:", error);
      setNotice(error.message || "更新招募狀態失敗，請稍後再試。");
    } finally {
      setIsUpdatingGroupId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            找組員
          </h1>
          <p className="text-slate-600">
            與正在尋找讀書夥伴或專題合作者的同學互相交流
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 rounded-lg bg-blue-300 px-6 text-base font-bold text-white shadow-sm hover:bg-blue-400">
              <Plus className="h-5 w-5" />
              建立揪人
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                建立揪人貼文
              </DialogTitle>
              <DialogDescription className="text-lg text-slate-500">
                填寫以下資訊以尋找讀書夥伴或專題合作者。
              </DialogDescription>
            </DialogHeader>

            {!studentId && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                請先使用學生帳號登入後再建立找組員貼文。
              </div>
            )}

            <div className="grid gap-5 py-6">
              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  系所
                </label>

                <Select
                  value={newPostDepartment}
                  onValueChange={handleNewPostDepartmentChange}
                  disabled={!studentId}
                >
                  <SelectTrigger className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-semibold text-slate-700 shadow-none">
                    <SelectValue placeholder="所有系所" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={ALL_DEPARTMENTS_ID}>
                      所有系所
                    </SelectItem>

                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isLoadingDepartments && (
                  <p className="text-sm text-slate-400 sm:col-start-2">
                    載入系所中...
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  課程
                </label>

                <Select
                  value={newPostCourse}
                  onValueChange={setNewPostCourse}
                  disabled={!studentId || !hasSelectedNewPostDepartment}
                >
                  <SelectTrigger className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-semibold text-slate-700 shadow-none">
                    <SelectValue
                      placeholder={
                        hasSelectedNewPostDepartment
                          ? "選擇課程"
                          : "請先選擇系所"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {createCourseOptions.map((course) => (
                      <SelectItem key={course.courseID} value={course.courseID}>
                        {course.courseCode || course.serialNumber}:{" "}
                        {cleanCourseTitle(course.title)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isLoadingCreateCourses && (
                  <p className="text-sm text-slate-400 sm:col-start-2">
                    載入課程中...
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  讀書風格
                </label>

                <Select
                  value={newPostStyle}
                  onValueChange={setNewPostStyle}
                  disabled={!studentId}
                >
                  <SelectTrigger className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-semibold text-slate-900 shadow-none">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {createStudyStyleOptions.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  需要人數
                </label>

                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={newPostNeededMembers}
                  onChange={(e) => setNewPostNeededMembers(e.target.value)}
                  placeholder="還需要幾位成員？"
                  disabled={!studentId}
                  className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-medium shadow-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  截止日期
                </label>

                <Input
                  type="datetime-local"
                  value={newPostDeadline}
                  onChange={(e) => setNewPostDeadline(e.target.value)}
                  disabled={!studentId}
                  className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-medium shadow-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  見面方式
                </label>

                <Select
                  value={newPostMeeting}
                  onValueChange={setNewPostMeeting}
                  disabled={!studentId}
                >
                  <SelectTrigger className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-semibold text-slate-900 shadow-none">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {createMeetingPreferenceOptions.map((preference) => (
                      <SelectItem key={preference} value={preference}>
                        {preference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  說明
                </label>

                <Textarea
                  value={newPostDescription}
                  onChange={(e) => setNewPostDescription(e.target.value)}
                  placeholder="你在尋找什麼樣的組員？"
                  disabled={!studentId}
                  className="min-h-24 rounded-lg border-0 bg-slate-50 px-5 py-4 text-lg shadow-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  尋找類型
                </label>

                <Input
                  value={newPostLookingFor}
                  onChange={(e) => setNewPostLookingFor(e.target.value)}
                  placeholder="例如：讀書夥伴、專題合作者"
                  disabled={!studentId}
                  className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-medium shadow-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  可配合時段
                </label>

                <Input
                  value={newPostAvailability}
                  onChange={(e) => setNewPostAvailability(e.target.value)}
                  placeholder="例如：平日晚上、週末"
                  disabled={!studentId}
                  className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-medium shadow-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
                <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">
                  聯絡方式
                </label>

                <Input
                  value={newPostContact}
                  onChange={(e) => setNewPostContact(e.target.value)}
                  placeholder="Email、Discord、Slack..."
                  disabled={!studentId}
                  className="h-14 rounded-lg border-0 bg-slate-50 px-5 text-lg font-medium shadow-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreatePost}
                disabled={!studentId || !canCreatePost || isCreatingPost}
                className="h-14 rounded-lg bg-blue-300 px-8 text-lg font-bold text-white hover:bg-blue-400 disabled:bg-blue-200"
              >
                {isCreatingPost ? "發布中..." : "發布"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {notice && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="space-y-4 lg:col-span-1">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-2xl font-semibold text-slate-900">
                篩選條件
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-6">

              <label className="block">
                <span className="mb-5 block text-lg font-semibold text-slate-900">
                  系所
                </span>

                <Select
                  value={selectedDepartment}
                  onValueChange={handleSelectedDepartmentChange}
                >
                  <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                    <SelectValue placeholder="所有系所" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={ALL_DEPARTMENTS_ID}>
                      所有系所
                    </SelectItem>

                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isLoadingDepartments && (
                  <p className="mt-2 text-xs text-slate-400">
                    載入系所中...
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-5 block text-lg font-semibold text-slate-900">
                  課程
                </span>

                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                  disabled={!hasSelectedDepartment}
                >
                  <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                    <SelectValue
                      placeholder={
                        hasSelectedDepartment
                          ? "所有課程"
                          : "請先選擇系所"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={ALL_COURSES_ID}>
                      所有課程
                    </SelectItem>

                    {courseOptions.map((course) => (
                      <SelectItem key={course.courseID} value={course.courseID}>
                        {course.courseCode || course.serialNumber}:{" "}
                        {cleanCourseTitle(course.title)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isLoadingCourses && (
                  <p className="mt-2 text-xs text-slate-400">
                    載入課程中...
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-5 block text-lg font-semibold text-slate-900">
                  讀書風格
                </span>

                <Select
                  value={selectedStudyStyle}
                  onValueChange={setSelectedStudyStyle}
                >
                  <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                    <SelectValue placeholder="所有風格" />
                  </SelectTrigger>

                  <SelectContent>
                    {studyStyleOptions.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="block">
                <span className="mb-5 block text-lg font-semibold text-slate-900">
                  見面偏好
                </span>

                <Select
                  value={selectedMeetingPreference}
                  onValueChange={setSelectedMeetingPreference}
                >
                  <SelectTrigger className="h-auto border-0 bg-transparent py-2 pl-7 pr-0 text-lg font-semibold text-slate-900 shadow-none focus:ring-0">
                    <SelectValue placeholder="所有偏好" />
                  </SelectTrigger>

                  <SelectContent>
                    {meetingPreferenceOptions.map((preference) => (
                      <SelectItem key={preference} value={preference}>
                        {preference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white text-sm text-slate-600 shadow-sm">
            <CardContent className="px-5 py-5">
              <div className="mb-3 font-semibold text-slate-900">
                找組員小技巧
              </div>

              <ul className="list-inside list-disc space-y-1 leading-relaxed">
                <li>清楚說明你的目標</li>
                <li>標明可配合的時段</li>
                <li>即時回覆訊息</li>
                <li>提前溝通好期望</li>
              </ul>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              共 {filteredGroups.length} 筆揪人
              {selectedCourseId !== ALL_COURSES_ID && selectedCourse
                ? `（${selectedCourse.courseCode || selectedCourse.courseID}）`
                : ""}
            </p>
          </div>

          {isLoadingGroups ? (
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-12 text-center text-slate-500">
                載入中...
              </CardContent>
            </Card>
          ) : filteredGroups.length === 0 ? (
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="px-6 py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />

                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  目前沒有揪人
                </h3>

                <p className="text-slate-500">
                  試著調整篩選條件或換個課程看看。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => {
                const member = isAlreadyMember(group);
                const leader = isLeader(group);
                const courseForGroup = courseById.get(group.course_id);
                const disabled =
                  !canApply(group) ||
                  isSubmittingGroupId === group.group_id;

                const deadline = group.recruitment_deadline
                  ? new Date(group.recruitment_deadline).toLocaleString([], {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "彈性";


                return (
                  <Card
                    key={group.group_id}
                    className="rounded-lg border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <CardHeader className="px-6 pt-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                            <Users className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="mb-1 text-sm font-medium text-slate-900">
                              {group.group_name}
                            </div>

                            <CardTitle className="text-xl font-semibold text-slate-900">
                              {courseForGroup?.courseCode ||
                                courseForGroup?.serialNumber ||
                                group.course_id}
                              : {cleanCourseTitle(courseForGroup?.title) || group.course_id}
                            </CardTitle>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-slate-100 text-slate-700"
                              >
                                還需 {getNeededMembers(group)} 人
                              </Badge>

                              <Badge
                                variant="outline"
                                className={
                                  group.status === "open"
                                    ? "rounded-full border-green-200 text-green-700"
                                    : "rounded-full border-slate-200 text-slate-600"
                                }
                              >
                                {group.status === "open" ? "開放中" : group.status === "closed" ? "已關閉" : group.status === "full" ? "已額滿" : group.status}
                              </Badge>

                              {studentId && (
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-rose-200 text-rose-700"
                                >
                                  配對{" "}
                                  {group.recommendation_score?.toFixed(1) ??
                                    "N/A"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-6">
                      <div className="space-y-4">
                        <p className="whitespace-pre-line leading-relaxed text-slate-600">
                          {group.description ||
                            "這個揪人貼文正在尋找課程合作者。"}
                        </p>

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div>
                            <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                              <Users className="h-4 w-4" />
                              尋找類型
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {(group.tags.length > 0
                                ? group.tags
                                : ["讀書夥伴", "專題合作者"]
                              ).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="rounded-full border-slate-200 text-slate-600"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                              <Clock className="h-4 w-4" />
                              可配合時段
                            </div>

                            <p className="flex items-center gap-2 text-slate-500">
                              <Calendar className="h-4 w-4" />
                              截止日期 {deadline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex-col items-stretch gap-3 border-t bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-end">
                      <Textarea
                        value={messageByGroupId[group.group_id] || ""}
                        onChange={(e) =>
                          setMessageByGroupId((prev) => ({
                            ...prev,
                            [group.group_id]: e.target.value,
                          }))
                        }
                        placeholder={
                          studentId
                            ? "寫一段簡短的申請說明..."
                            : "請先登入後再填寫申請說明..."
                        }
                        disabled={!studentId || disabled || member || leader}
                        className="min-h-11 flex-1 bg-white focus-visible:ring-rose-500/20"
                      />

                      {leader && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleToggleRecruitment(group)}
                          disabled={isUpdatingGroupId === group.group_id}
                          className="h-11 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        >
                          {isUpdatingGroupId === group.group_id
                            ? "更新中..."
                            : group.status === "open"
                              ? "關閉招募"
                              : "重新開放招募"}
                        </Button>
                      )}

                      {!studentId ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="h-11 bg-rose-700 text-white shadow-sm shadow-rose-700/20 hover:bg-rose-800"
                            >
                              <Mail className="h-4 w-4" />
                              {getButtonLabel(group)}
                            </Button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>需要登入</DialogTitle>
                              <DialogDescription>
                                請先使用學生帳號登入，再申請加入揪人。
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                              <Button
                                type="button"
                                className="bg-rose-700 text-white hover:bg-rose-800"
                                onClick={() => {
                                  window.location.href = "/auth/login";
                                }}
                              >
                                前往登入
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button
                          onClick={() => handleApply(group)}
                          disabled={disabled}
                          className="h-11 bg-rose-700 text-white shadow-sm shadow-rose-700/20 hover:bg-rose-800"
                        >
                          <Send className="h-4 w-4" />
                          {getButtonLabel(group)}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}