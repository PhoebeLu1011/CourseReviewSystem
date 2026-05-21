// 還沒拆檔案，只是先確定前端可以跑起來

import { useEffect, useMemo, useState } from "react";
import type { Group } from "../models/Group";
import type { Application } from "../models/Application";
import { API_BASE_URL } from "../config/api";

const mockUser = {
  id: "41271122H",
  name: "Test Student",
  role: "Student",
  studentID: "41271122H",
};

const mockCourses = [
  { id: "CS101", code: "CS101", name: "Introduction to Computer Science" },
  { id: "OOAD", code: "OOAD", name: "Object-Oriented Analysis and Design" },
  { id: "DBMS", code: "DBMS", name: "Database Management Systems" },
];

export default function GroupmatesIntegrated() {
  const [selectedCourseId, setSelectedCourseId] = useState("OOAD");
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageByGroupId, setMessageByGroupId] = useState<Record<string, string>>({});
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmittingGroupId, setIsSubmittingGroupId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const studentId = mockUser.studentID;

  useEffect(() => {
    loadGroups();
    loadPendingApplications();
  }, [selectedCourseId]);

  const loadGroups = async () => {
    setIsLoadingGroups(true);
    setNotice("");

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

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const keyword = searchQuery.trim().toLowerCase();

      if (!keyword) return true;

      return (
        group.group_name.toLowerCase().includes(keyword) ||
        group.description?.toLowerCase().includes(keyword) ||
        group.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    });
  }, [groups, searchQuery]);

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

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find Groupmates</h1>
          <p className="mt-2 text-slate-600">
            目前小組推薦與申請流程會從後端 API 取得資料。
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Current user: {mockUser.name} / {studentId}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          >
            {mockCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search group name, tag..."
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          />
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}

      {isLoadingGroups ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading groups...
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          目前沒有符合條件的小組。
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredGroups.map((group) => {
            const pending = hasPendingApplication(group.group_id);
            const full = isGroupFull(group);
            const member = isAlreadyMember(group);
            const leader = isLeader(group);
            const disabled =
              !canApply(group) || isSubmittingGroupId === group.group_id;

            return (
              <div
                key={group.group_id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {group.group_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Course: {group.course_id}
                    </p>
                  </div>

                  <span
                    className={
                      group.status === "open"
                        ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                    }
                  >
                    {group.status}
                  </span>
                </div>

                {group.description && (
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">
                    {group.description}
                  </p>
                )}

                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-slate-500">Members</div>
                    <div className="mt-1 font-bold text-slate-900">
                      {group.members.length} / {group.max_members}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-slate-500">Score</div>
                    <div className="mt-1 font-bold text-slate-900">
                      {group.recommendation_score?.toFixed(1) ?? "N/A"}
                    </div>
                  </div>
                </div>

                {group.recruitment_deadline && (
                  <p className="mb-4 text-sm text-slate-500">
                    Deadline:{" "}
                    {new Date(group.recruitment_deadline).toLocaleDateString()}
                  </p>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <textarea
                  value={messageByGroupId[group.group_id] || ""}
                  onChange={(e) =>
                    setMessageByGroupId((prev) => ({
                      ...prev,
                      [group.group_id]: e.target.value,
                    }))
                  }
                  placeholder="Write a short application message..."
                  disabled={disabled || member || leader}
                  className="mb-3 min-h-20 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  onClick={() => handleApply(group)}
                  disabled={disabled}
                  className="w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-700/20 transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {leader
                    ? "You are the leader"
                    : member
                    ? "Already a member"
                    : pending
                    ? "Pending"
                    : full
                    ? "Group is full"
                    : group.status !== "open"
                    ? "Closed"
                    : isSubmittingGroupId === group.group_id
                    ? "Submitting..."
                    : "Apply to Join"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}