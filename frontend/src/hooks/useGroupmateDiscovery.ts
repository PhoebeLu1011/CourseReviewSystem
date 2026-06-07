import { useCallback, useEffect, useMemo, useState } from "react";

import { createApplication, getPendingApplications } from "../api/applicationApi";
import { getCourse, getDepartments, searchCourses, type Course } from "../api/courseApi";
import { closeGroup, getRecommendedGroups, getRecommendedGroupsByCourse, reopenGroup} from "../api/groupApi";
import {
  ALL_COURSES_ID,
  ALL_DEPARTMENTS_ID,
  ALL_MEETING_PREFERENCES_ID,
  ALL_STUDY_STYLES_ID,
  COURSE_OPTION_LIMIT,
} from "../components/groupmates/groupmateOptions";

import type { Application } from "../models/Application";
import type { Group } from "../models/Group";
import { getErrorMessage } from "../utils/errors";

const dedupeCoursesById = (courses: Course[]) =>
  Array.from(new Map(courses.map((course) => [course.courseID, course])).values());

export function useGroupmateDiscovery(studentId: string) {
  const [selectedDepartment, setSelectedDepartment] = useState(ALL_DEPARTMENTS_ID);
  const [selectedCourseId, setSelectedCourseId] = useState(ALL_COURSES_ID);
  const [selectedStudyStyle, setSelectedStudyStyle] = useState(ALL_STUDY_STYLES_ID);
  const [selectedMeetingPreference, setSelectedMeetingPreference] = useState(ALL_MEETING_PREFERENCES_ID);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [knownCourses, setKnownCourses] = useState<Course[]>([]);
  const [messageByGroupId, setMessageByGroupId] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmittingGroupId, setIsSubmittingGroupId] = useState<string | null>(null);
  const [isUpdatingGroupId, setIsUpdatingGroupId] = useState<string | null>(null);

  const hasSelectedDepartment = selectedDepartment !== ALL_DEPARTMENTS_ID;
  const courseById = useMemo(() => {
    const courses = [...knownCourses, ...courseOptions];
    return new Map(
      courses.flatMap((course) => [
        [course.courseID, course] as const,
        ...(course.serialNumber
          ? [[course.serialNumber, course] as const]
          : []),
      ])
    );
  }, [knownCourses, courseOptions]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingDepartments(true);
    getDepartments()
      .then((result) => {
        if (!cancelled) setDepartments(result);
      })
      .catch(() => {
        if (!cancelled) setNotice("無法載入系所資料，請確認後端與資料庫是否已啟動。");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDepartments(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!hasSelectedDepartment) {
      setCourseOptions([]);
      return;
    }
    setIsLoadingCourses(true);
    searchCourses("", selectedDepartment, "", "", "", COURSE_OPTION_LIMIT, 0)
      .then((result) => {
        if (!cancelled) {
          const courses = dedupeCoursesById(result.courses);
          setCourseOptions(courses);
          setKnownCourses((current) => dedupeCoursesById([...current, ...courses]));
        }
      })
      .catch(() => {
        if (!cancelled) setNotice("無法載入課程資料，請確認後端與資料庫是否已啟動。");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCourses(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hasSelectedDepartment, selectedDepartment]);

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    setNotice("");
    try {
      let loadedGroups: Group[];
      if (!hasSelectedDepartment) {
        loadedGroups = await getRecommendedGroups(studentId || undefined);
      } else if (selectedCourseId !== ALL_COURSES_ID) {
        loadedGroups = await getRecommendedGroupsByCourse(
          selectedCourseId,
          studentId || undefined
        );
      } else {
        const responses = await Promise.all(
          courseOptions.map((course) =>
            getRecommendedGroupsByCourse(course.courseID, studentId || undefined)
          )
        );
        loadedGroups = Array.from(
          new Map(responses.flat().map((group) => [group.group_id, group])).values()
        ).sort(
          (a, b) => (b.recommendation_score ?? 0) - (a.recommendation_score ?? 0)
        );
      }

      setGroups(loadedGroups);

      const missingCourseIds = Array.from(
        new Set(
          loadedGroups
            .map((group) => group.course_id)
            .filter((courseId) => !courseById.has(courseId))
        )
      );
      if (missingCourseIds.length > 0) {
        const results = await Promise.allSettled(missingCourseIds.map(getCourse));
        const loadedCourses = results
          .filter(
            (result): result is PromiseFulfilledResult<Course> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value);
        if (loadedCourses.length > 0) {
          setKnownCourses((current) =>
            dedupeCoursesById([...current, ...loadedCourses])
          );
        }
      }
    } catch {
      setGroups([]);
      setNotice("無法載入推薦小組，請確認後端與資料庫是否已啟動。");
    } finally {
      setIsLoadingGroups(false);
    }
  }, [courseById, courseOptions, hasSelectedDepartment, selectedCourseId, studentId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!studentId) {
      setPendingApplications([]);
      return;
    }
    getPendingApplications(studentId)
      .then(setPendingApplications)
      .catch(() => setPendingApplications([]));
  }, [studentId]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const tags = new Set(group.tags.map((tag) => tag.toLowerCase()));
      return (
        (selectedStudyStyle === ALL_STUDY_STYLES_ID || tags.has(selectedStudyStyle.toLowerCase())) &&
        (selectedMeetingPreference === ALL_MEETING_PREFERENCES_ID ||
          tags.has(selectedMeetingPreference.toLowerCase()))
      );
    });
  }, [groups, selectedMeetingPreference, selectedStudyStyle]);

  const hasPendingForCourse = (courseId: string) =>
    pendingApplications.some(
      (application) =>
        application.course_id === courseId && application.status === "pending"
    );

  const canApply = (group: Group) =>
    Boolean(studentId) &&
    group.status === "open" &&
    group.members.length < group.max_members &&
    !group.members.includes(studentId) &&
    !hasPendingForCourse(group.course_id);

  const getButtonLabel = (group: Group) => {
    if (!studentId) return "登入後申請";
    if (isSubmittingGroupId === group.group_id) return "送出中...";
    if (group.leader_id === studentId) return "你是組長";
    if (group.members.includes(studentId)) return "已是成員";
    if (hasPendingForCourse(group.course_id)) return "同課程已有申請";
    if (group.members.length >= group.max_members) return "已額滿";
    if (group.status !== "open") return "已關閉";
    return "申請加入";
  };

  const applyToGroup = async (group: Group) => {
    if (!canApply(group)) return;
    setIsSubmittingGroupId(group.group_id);
    try {
      const application = await createApplication({
        group_id: group.group_id,
        message: messageByGroupId[group.group_id]?.trim() || "我想加入這個小組，謝謝！",
      });
      setPendingApplications((current) => [...current, application]);
      setMessageByGroupId((current) => ({ ...current, [group.group_id]: "" }));
      setNotice("申請已送出！");
    } catch (error) {
      setNotice(getErrorMessage(error, "申請失敗，請稍後再試。"));
    } finally {
      setIsSubmittingGroupId(null);
    }
  };

  const toggleRecruitment = async (group: Group) => {
    if (group.leader_id !== studentId) return;
    setIsUpdatingGroupId(group.group_id);
    try {
      const updated =
        group.status === "open"
          ? await closeGroup(group.group_id)
          : await reopenGroup(group.group_id);
      setGroups((current) =>
        current.map((item) => (item.group_id === updated.group_id ? updated : item))
      );
      setNotice(group.status === "open" ? "招募已關閉。" : "招募已重新開啟。");
    } catch (error) {
      setNotice(getErrorMessage(error, "更新招募狀態失敗，請稍後再試。"));
    } finally {
      setIsUpdatingGroupId(null);
    }
  };

  const changeDepartment = (department: string) => {
    setSelectedDepartment(department);
    setSelectedCourseId(ALL_COURSES_ID);
  };

  const addCreatedGroup = (group: Group, course: Course) => {
    setKnownCourses((current) => dedupeCoursesById([course, ...current]));
    setGroups((current) => [group, ...current]);
  };

  return {
    selectedDepartment,
    selectedCourseId,
    selectedStudyStyle,
    selectedMeetingPreference,
    filteredGroups,
    departments,
    courseOptions,
    courseById,
    messageByGroupId,
    notice,
    isLoadingDepartments,
    isLoadingCourses,
    isLoadingGroups,
    isSubmittingGroupId,
    isUpdatingGroupId,
    setSelectedCourseId,
    setSelectedStudyStyle,
    setSelectedMeetingPreference,
    setMessageByGroupId,
    setNotice,
    changeDepartment,
    addCreatedGroup,
    canApply,
    getButtonLabel,
    applyToGroup,
    toggleRecruitment,
  };
}
