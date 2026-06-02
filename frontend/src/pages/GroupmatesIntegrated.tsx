import { useEffect, useMemo, useState } from "react";
import { Sparkles, Users } from "lucide-react";
import type { Group } from "../models/Group";
import type { Application } from "../models/Application";
import { API_BASE_URL } from "../config/api";
import { GroupCard } from "../components/groups/GroupCard";
import { GroupFilters } from "../components/groups/GroupFilters";
import type {
  AvailabilityFilter,
  CourseDetail,
  CourseOption,
  GroupStatusFilter,
} from "../components/groups/types";
import { Card, CardContent } from "../components/ui/card";

const mockUser = {
  id: "41271122H",
  name: "Test Student",
  role: "Student",
  studentID: "41271122H",
};

const mockCourses: CourseOption[] = [
  { id: "CS101", code: "CS101", name: "Introduction to Computer Science" },
  { id: "OOAD", code: "OOAD", name: "Object-Oriented Analysis and Design" },
  { id: "DBMS", code: "DBMS", name: "Database Management Systems" },
];

export default function GroupmatesIntegrated() {
  const [selectedCourseId, setSelectedCourseId] = useState("OOAD");
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GroupStatusFilter>("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [messageByGroupId, setMessageByGroupId] = useState<Record<string, string>>({});
  const [courseDetailsById, setCourseDetailsById] = useState<
    Record<string, CourseDetail>
  >({});
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmittingGroupId, setIsSubmittingGroupId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const studentId = mockUser.studentID;

  useEffect(() => {
    loadGroups();
    loadPendingApplications();
  }, [selectedCourseId]);

  const selectedCourse = mockCourses.find((course) => course.id === selectedCourseId);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    groups.forEach((group) => group.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const keyword = searchQuery.trim().toLowerCase();
      const isFull = group.members.length >= group.max_members;
      const courseLabel = [
        group.course?.courseID,
        group.course?.title,
        group.course?.department,
        group.course?.professors,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !keyword ||
        group.group_name.toLowerCase().includes(keyword) ||
        group.description?.toLowerCase().includes(keyword) ||
        group.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
        courseLabel.includes(keyword);

      const matchesStatus =
        statusFilter === "all" || group.status === statusFilter;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && !isFull) ||
        (availabilityFilter === "full" && isFull);
      const matchesTag = tagFilter === "all" || group.tags.includes(tagFilter);

      return matchesSearch && matchesStatus && matchesAvailability && matchesTag;
    });
  }, [availabilityFilter, groups, searchQuery, statusFilter, tagFilter]);

  const loadGroups = async () => {
    setIsLoadingGroups(true);
    setNotice("");
    setExpandedGroupId(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${selectedCourseId}/groups/recommended?student_id=${studentId}`
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Backend groups API failed");
      }

      setGroups(data as Group[]);
    } catch (error) {
      console.warn(error);
      setGroups([]);
      setNotice("無法載入推薦小組，請確認後端與資料庫是否已啟動。");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const loadPendingApplications = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/students/${studentId}/applications/pending`
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Backend applications API failed");
      }

      setPendingApplications(data as Application[]);
    } catch (error) {
      console.warn(error);
      setPendingApplications([]);
    }
  };

  const loadCourseDetail = async (courseId: string) => {
    if (courseDetailsById[courseId]) return;

    setLoadingCourseId(courseId);

    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Backend course API failed");
      }

      setCourseDetailsById((prev) => ({
        ...prev,
        [courseId]: data as CourseDetail,
      }));
    } catch (error) {
      console.warn(error);
      setNotice("無法載入課程詳細資訊，請稍後再試。");
    } finally {
      setLoadingCourseId(null);
    }
  };

  const handleToggleMoreInfo = async (group: Group) => {
    if (expandedGroupId === group.group_id) {
      setExpandedGroupId(null);
      return;
    }

    setExpandedGroupId(group.group_id);
    await loadCourseDetail(group.course_id);
  };

  const handleMessageChange = (groupId: string, value: string) => {
    setMessageByGroupId((prev) => ({
      ...prev,
      [groupId]: value,
    }));
  };

  const hasPendingApplication = (groupId: string) => {
    return pendingApplications.some(
      (app) => app.group_id === groupId && app.status === "pending"
    );
  };

  const isGroupFull = (group: Group) => {
    return group.members.length >= group.max_members;
  };

  const isAlreadyMember = (group: Group) => {
    return group.members.includes(studentId);
  };

  const isLeader = (group: Group) => {
    return group.leader_id === studentId;
  };

  const canApply = (group: Group) => {
    return (
      group.status === "open" &&
      !isGroupFull(group) &&
      !isAlreadyMember(group) &&
      !hasPendingApplication(group.group_id)
    );
  };

  const handleApply = async (group: Group) => {
    const message =
      messageByGroupId[group.group_id]?.trim() ||
      "I would like to join your group.";

    setIsSubmittingGroupId(group.group_id);
    setNotice("");

    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          group_id: group.group_id,
          message,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setNotice(data?.message || "申請失敗，請稍後再試。");
        return;
      }

      setNotice("申請已送出！");
      setPendingApplications((prev) => [...prev, data as Application]);
      setMessageByGroupId((prev) => ({ ...prev, [group.group_id]: "" }));
    } catch (error) {
      console.warn(error);
      setNotice("申請失敗，請確認後端與資料庫是否已啟動。");
    } finally {
      setIsSubmittingGroupId(null);
    }
  };

  const getApplyButtonText = (group: Group) => {
    if (isLeader(group)) return "You are the leader";
    if (isAlreadyMember(group)) return "Already a member";
    if (hasPendingApplication(group.group_id)) return "Pending";
    if (isGroupFull(group)) return "Group is full";
    if (group.status !== "open") return "Closed";
    if (isSubmittingGroupId === group.group_id) return "Submitting...";
    return "Apply to Join";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Find Groupmates</h1>
          <p className="mt-2 text-slate-600">
            Connect with classmates through course-based project groups.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Current user: {mockUser.name} / {studentId}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Sparkles className="h-4 w-4 text-rose-600" />
          {selectedCourse?.code ?? selectedCourseId}
        </div>
      </div>

      {notice && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <GroupFilters
          availableTags={availableTags}
          courses={mockCourses}
          searchQuery={searchQuery}
          selectedCourseId={selectedCourseId}
          selectedCourse={selectedCourse}
          statusFilter={statusFilter}
          availabilityFilter={availabilityFilter}
          tagFilter={tagFilter}
          onSearchQueryChange={setSearchQuery}
          onSelectedCourseIdChange={setSelectedCourseId}
          onStatusFilterChange={setStatusFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
          onTagFilterChange={setTagFilter}
        />

        <main className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {filteredGroups.length} group
              {filteredGroups.length === 1 ? "" : "s"}
            </p>
          </div>

          {isLoadingGroups ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Loading groups...
              </CardContent>
            </Card>
          ) : filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">
                  No groups found
                </h2>
                <p className="mt-2 text-slate-500">
                  Try another course or adjust your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => {
                const pending = hasPendingApplication(group.group_id);
                const full = isGroupFull(group);
                const member = isAlreadyMember(group);
                const leader = isLeader(group);
                const disabled =
                  !canApply(group) || isSubmittingGroupId === group.group_id;

                return (
                  <GroupCard
                    key={group.group_id}
                    group={group}
                    courseDetail={courseDetailsById[group.course_id]}
                    isExpanded={expandedGroupId === group.group_id}
                    isCourseDetailLoading={loadingCourseId === group.course_id}
                    message={messageByGroupId[group.group_id] || ""}
                    isPending={pending}
                    isFull={full}
                    isMember={member}
                    isLeader={leader}
                    isApplyDisabled={disabled}
                    applyButtonText={getApplyButtonText(group)}
                    onMessageChange={handleMessageChange}
                    onToggleMoreInfo={handleToggleMoreInfo}
                    onApply={handleApply}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
