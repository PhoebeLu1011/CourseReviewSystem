import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { searchCourses, type Course } from "../../api/courseApi";
import { createGroup } from "../../api/groupApi";
import type { Group } from "../../models/Group";
import { getErrorMessage } from "../../utils/errors";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  ALL_DEPARTMENTS_ID,
  COURSE_OPTION_LIMIT,
  cleanCourseTitle,
  createMeetingPreferenceOptions,
  createStudyStyleOptions,
} from "./groupmateOptions";

interface CreateGroupDialogProps {
  studentId: string;
  userName: string;
  departments: string[];
  isLoadingDepartments: boolean;
  onCreated: (group: Group, course: Course) => void;
  onNotice: (message: string) => void;
}

export function CreateGroupDialog({
  studentId,
  userName,
  departments,
  isLoadingDepartments,
  onCreated,
  onNotice,
}: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [department, setDepartment] = useState(ALL_DEPARTMENTS_ID);
  const [courseId, setCourseId] = useState("");
  const [style, setStyle] = useState("pair");
  const [meeting, setMeeting] = useState("hybrid");
  const [neededMembers, setNeededMembers] = useState("1");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [availability, setAvailability] = useState("");
  const [contact, setContact] = useState("");
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasDepartment = department !== ALL_DEPARTMENTS_ID;
  const neededCount = Number(neededMembers);
  const canSubmit =
    hasDepartment &&
    Boolean(courseId) &&
    Number.isInteger(neededCount) &&
    neededCount >= 1 &&
    neededCount <= 20 &&
    Boolean(description.trim()) &&
    Boolean(contact.trim());

  useEffect(() => {
    let cancelled = false;
    if (!hasDepartment) {
      setCourseOptions([]);
      return;
    }

    setLoadingCourses(true);
    searchCourses("", department, "", "", "", COURSE_OPTION_LIMIT, 0)
      .then((result) => {
        if (!cancelled) {
          setCourseOptions(
            Array.from(
              new Map(result.courses.map((course) => [course.courseID, course])).values()
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) onNotice("無法載入建立貼文用的課程資料。");
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });

    return () => {
      cancelled = true;
    };
  }, [department, hasDepartment, onNotice]);

  const reset = () => {
    setDepartment(ALL_DEPARTMENTS_ID);
    setCourseId("");
    setStyle("pair");
    setMeeting("hybrid");
    setNeededMembers("1");
    setDescription("");
    setDeadline("");
    setLookingFor("");
    setAvailability("");
    setContact("");
  };

  const handleSubmit = async () => {
    if (!studentId) {
      onNotice("請先使用學生帳號登入後再建立找組員貼文。");
      setOpen(false);
      return;
    }
    if (!canSubmit) {
      onNotice("請完整填寫課程、需求人數、描述與聯絡方式。");
      return;
    }

    const course = courseOptions.find((option) => option.courseID === courseId);
    if (!course) {
      onNotice("找不到選擇的課程，請重新選擇。");
      return;
    }

    const extraTags = lookingFor.split(",").map((item) => item.trim()).filter(Boolean);
    const descriptionParts = [
      description.trim(),
      availability.trim() ? `可配合時段：${availability.trim()}` : "",
      contact.trim() ? `聯絡方式：${contact.trim()}` : "",
    ].filter(Boolean);

    setSubmitting(true);
    try {
      const group = await createGroup({
        group_name: `${userName || "同學"}的揪人貼文`,
        course_id: course.courseID,
        needed_members: neededCount,
        recruitment_deadline: deadline ? new Date(deadline).toISOString() : null,
        description: descriptionParts.join("\n"),
        tags: [style, meeting, ...extraTags],
      });
      onCreated(group, course);
      onNotice("找組員貼文已建立。");
      setOpen(false);
      reset();
    } catch (error) {
      onNotice(getErrorMessage(error, "建立找組員貼文失敗，請稍後再試。"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 rounded-lg bg-blue-300 px-6 text-base font-bold text-white shadow-sm hover:bg-blue-400">
          <Plus className="h-5 w-5" />建立揪人
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">建立揪人貼文</DialogTitle>
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
          <FormField label="系所">
            <Select value={department} onValueChange={(value) => { setDepartment(value); setCourseId(""); }} disabled={!studentId}>
              <SelectTrigger className="h-14 border-0 bg-slate-50 px-5 text-lg font-semibold shadow-none">
                <SelectValue placeholder="所有系所" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENTS_ID}>所有系所</SelectItem>
                {departments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            {isLoadingDepartments && <p className="text-sm text-slate-400">載入系所中...</p>}
          </FormField>
          <FormField label="課程">
            <Select value={courseId} onValueChange={setCourseId} disabled={!studentId || !hasDepartment}>
              <SelectTrigger className="h-14 border-0 bg-slate-50 px-5 text-lg font-semibold shadow-none">
                <SelectValue placeholder={hasDepartment ? "選擇課程" : "請先選擇系所"} />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((course) => (
                  <SelectItem key={course.courseID} value={course.courseID}>
                    {course.courseCode || course.serialNumber}: {cleanCourseTitle(course.title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingCourses && <p className="text-sm text-slate-400">載入課程中...</p>}
          </FormField>
          <FormField label="讀書風格">
            <Select value={style} onValueChange={setStyle} disabled={!studentId}>
              <SelectTrigger className="h-14 border-0 bg-slate-50 px-5 text-lg font-semibold shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {createStudyStyleOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="需要人數">
            <Input type="number" min={1} max={20} value={neededMembers} onChange={(event) => setNeededMembers(event.target.value)} disabled={!studentId} className="h-14 border-0 bg-slate-50 px-5 text-lg shadow-none" />
          </FormField>
          <FormField label="截止日期">
            <Input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} disabled={!studentId} className="h-14 border-0 bg-slate-50 px-5 text-lg shadow-none" />
          </FormField>
          <FormField label="見面方式">
            <Select value={meeting} onValueChange={setMeeting} disabled={!studentId}>
              <SelectTrigger className="h-14 border-0 bg-slate-50 px-5 text-lg font-semibold shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {createMeetingPreferenceOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="說明">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} disabled={!studentId} className="min-h-24 border-0 bg-slate-50 px-5 py-4 text-lg shadow-none" />
          </FormField>
          <FormField label="尋找類型">
            <Input value={lookingFor} onChange={(event) => setLookingFor(event.target.value)} disabled={!studentId} className="h-14 border-0 bg-slate-50 px-5 text-lg shadow-none" />
          </FormField>
          <FormField label="可配合時段">
            <Input value={availability} onChange={(event) => setAvailability(event.target.value)} disabled={!studentId} className="h-14 border-0 bg-slate-50 px-5 text-lg shadow-none" />
          </FormField>
          <FormField label="聯絡方式">
            <Input value={contact} onChange={(event) => setContact(event.target.value)} disabled={!studentId} className="h-14 border-0 bg-slate-50 px-5 text-lg shadow-none" />
          </FormField>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={!studentId || !canSubmit || submitting} className="h-14 bg-blue-300 px-8 text-lg font-bold text-white hover:bg-blue-400">
            {submitting ? "發布中..." : "發布"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[190px_1fr] sm:items-center">
      <label className="text-left text-lg font-semibold text-slate-900 sm:text-right">{label}</label>
      <div>{children}</div>
    </div>
  );
}
