import {
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import type { Group } from "../../models/Group";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { GroupCourseDetails } from "./GroupCourseDetails";
import type { CourseDetail } from "./types";

interface GroupCardProps {
  group: Group;
  courseDetail?: CourseDetail;
  isExpanded: boolean;
  isCourseDetailLoading: boolean;
  message: string;
  isPending: boolean;
  isFull: boolean;
  isMember: boolean;
  isLeader: boolean;
  isApplyDisabled: boolean;
  applyButtonText: string;
  onMessageChange: (groupId: string, value: string) => void;
  onToggleMoreInfo: (group: Group) => void;
  onApply: (group: Group) => void;
}

export function GroupCard({
  group,
  courseDetail,
  isExpanded,
  isCourseDetailLoading,
  message,
  isPending,
  isFull,
  isMember,
  isLeader,
  isApplyDisabled,
  applyButtonText,
  onMessageChange,
  onToggleMoreInfo,
  onApply,
}: GroupCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl font-bold text-slate-950">
                {group.group_name}
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {group.course?.courseID ?? group.course_id}
                {group.course?.title ? ` · ${group.course.title}` : ""}
              </p>
              {group.course?.professors && (
                <p className="mt-1 text-sm text-slate-500">
                  Professor: {group.course.professors}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant={group.status === "open" ? "default" : "secondary"}
            className="capitalize"
          >
            {group.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {group.description && (
          <p className="text-sm leading-relaxed text-slate-600">
            {group.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-slate-600">
            <Users className="h-4 w-4" />
            <span>
              {group.members.length}/{group.max_members} members
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-slate-600">
            <Sparkles className="h-4 w-4" />
            <span>Score {group.recommendation_score?.toFixed(1) ?? "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-slate-600">
            <Clock className="h-4 w-4" />
            <span>
              {group.recruitment_deadline
                ? new Date(group.recruitment_deadline).toLocaleDateString()
                : "No deadline"}
            </span>
          </div>
        </div>

        {group.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {isExpanded && (
          <GroupCourseDetails
            courseDetail={courseDetail}
            isLoading={isCourseDetailLoading}
          />
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
          {isLeader && <Badge>You are the leader</Badge>}

          <Textarea
            value={message}
            onChange={(event) =>
              onMessageChange(group.group_id, event.target.value)
            }
            placeholder="Write a short application message..."
            disabled={isApplyDisabled || isMember || isLeader}
            className="min-h-20 bg-white"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => onToggleMoreInfo(group)}
              className="sm:w-auto"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              More Info
            </Button>

            <Button
              onClick={() => onApply(group)}
              disabled={isApplyDisabled}
              className="flex-1"
            >
              {!isApplyDisabled && <Send className="h-4 w-4" />}
              {applyButtonText}
            </Button>
          </div>

          {(isPending || isFull || isMember) && !isLeader && (
            <p className="text-center text-sm text-slate-500">
              {isPending
                ? "Your application is waiting for review."
                : isFull
                ? "This group is currently full."
                : "You are already in this group."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
