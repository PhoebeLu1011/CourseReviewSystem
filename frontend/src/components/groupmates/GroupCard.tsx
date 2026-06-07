import { Calendar, Clock, Mail, Send, Users } from "lucide-react";

import type { Course } from "../../api/courseApi";
import type { Group } from "../../models/Group";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import {
  formatCourseLabel,
  formatGroupName,
  formatGroupTagLabel,
} from "./groupmateOptions";

interface GroupCardProps {
  group: Group;
  course?: Course;
  studentId: string;
  message: string;
  canApply: boolean;
  buttonLabel: string;
  isSubmitting: boolean;
  isUpdating: boolean;
  onMessageChange: (message: string) => void;
  onApply: () => void;
  onToggleRecruitment: () => void;
}

export function GroupCard({
  group,
  course,
  studentId,
  message,
  canApply,
  buttonLabel,
  isSubmitting,
  isUpdating,
  onMessageChange,
  onApply,
  onToggleRecruitment,
}: GroupCardProps) {
  const member = Boolean(studentId) && group.members.includes(studentId);
  const leader = Boolean(studentId) && group.leader_id === studentId;
  const disabled = !canApply || isSubmitting;
  const neededMembers = group.needed_members ?? Math.max(group.max_members - group.members.length, 0);
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
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <CardHeader className="px-6 pt-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium text-slate-900">
                {formatGroupName(group.group_name)}
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                {formatCourseLabel(course, group.course_id)}
              </CardTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                  還需 {neededMembers} 人
                </Badge>
                <Badge
                  variant="outline"
                  className={group.status === "open" ? "rounded-full border-green-200 text-green-700" : "rounded-full border-slate-200 text-slate-600"}
                >
                  {group.status === "open" ? "開放中" : "已關閉"}
                </Badge>
                {studentId && (
                  <Badge variant="outline" className="rounded-full border-rose-200 text-rose-700">
                    配對 {group.recommendation_score?.toFixed(1) ?? "N/A"}
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
            {group.description || "這個揪人貼文正在尋找課程合作者。"}
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                <Users className="h-4 w-4" />尋找類型
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(group.tags.length > 0 ? group.tags : ["讀書夥伴", "專題合作者"]).map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full border-slate-200 text-slate-600">
                    {formatGroupTagLabel(tag)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                <Clock className="h-4 w-4" />可配合時段
              </div>
              <p className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />截止日期 {deadline}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 border-t bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-end">
        <Textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder={studentId ? "寫一段簡短的申請說明..." : "請先登入後再填寫申請說明..."}
          disabled={!studentId || disabled || member || leader}
          className="min-h-11 flex-1 bg-white focus-visible:ring-rose-500/20"
        />
        {leader && (
          <Button
            type="button"
            variant="outline"
            onClick={onToggleRecruitment}
            disabled={isUpdating}
            className="h-11 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            {isUpdating ? "更新中..." : group.status === "open" ? "關閉招募" : "重新開放招募"}
          </Button>
        )}
        {!studentId ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-11 bg-rose-700 text-white shadow-sm shadow-rose-700/20 hover:bg-rose-800">
                <Mail className="h-4 w-4" />{buttonLabel}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>需要登入</DialogTitle>
                <DialogDescription>請先使用學生帳號登入，再申請加入揪人。</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  className="bg-rose-700 text-white hover:bg-rose-800"
                  onClick={() => { window.location.href = "/auth/login"; }}
                >
                  前往登入
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={onApply}
            disabled={disabled}
            className="h-11 bg-rose-700 text-white shadow-sm shadow-rose-700/20 hover:bg-rose-800"
          >
            <Send className="h-4 w-4" />{buttonLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
