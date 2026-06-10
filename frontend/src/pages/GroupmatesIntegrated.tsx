import { Users } from "lucide-react";

import { CreateGroupDialog } from "../components/groupmates/CreateGroupDialog";
import { GroupCard } from "../components/groupmates/GroupCard";
import { GroupFilters } from "../components/groupmates/GroupFilters";
import { ALL_COURSES_ID } from "../components/groupmates/groupmateOptions";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { useGroupmateDiscovery } from "../hooks/useGroupmateDiscovery";
import { formatCourseDisplayCode } from "../utils/courseDisplay";

export default function GroupmatesIntegrated() {
  const { user } = useAuth();
  const studentId = user?.role.toLowerCase() === "student" ? user.id : "";
  const discovery = useGroupmateDiscovery(studentId);
  const selectedCourse = discovery.courseById.get(discovery.selectedCourseId);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">找組員</h1>
          <p className="text-slate-600">與正在尋找讀書夥伴或專題合作者的同學互相交流</p>
        </div>
        <CreateGroupDialog
          studentId={studentId}
          userName={user?.name || "Student"}
          departments={discovery.departments}
          isLoadingDepartments={discovery.isLoadingDepartments}
          onCreated={discovery.addCreatedGroup}
          onNotice={discovery.setNotice}
        />
      </div>

      {discovery.notice && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {discovery.notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <GroupFilters
          departments={discovery.departments}
          courseOptions={discovery.courseOptions}
          selectedDepartment={discovery.selectedDepartment}
          selectedCourseId={discovery.selectedCourseId}
          selectedStudyStyle={discovery.selectedStudyStyle}
          selectedMeetingPreference={discovery.selectedMeetingPreference}
          isLoadingDepartments={discovery.isLoadingDepartments}
          isLoadingCourses={discovery.isLoadingCourses}
          onDepartmentChange={discovery.changeDepartment}
          onCourseChange={discovery.setSelectedCourseId}
          onStudyStyleChange={discovery.setSelectedStudyStyle}
          onMeetingPreferenceChange={discovery.setSelectedMeetingPreference}
        />

        <main className="lg:col-span-3">
          <p className="mb-4 text-sm text-slate-500">
            共 {discovery.filteredGroups.length} 筆揪人
            {discovery.selectedCourseId !== ALL_COURSES_ID && selectedCourse
              ? `（${selectedCourse.courseCode || formatCourseDisplayCode(selectedCourse.courseID)}）`
              : ""}
          </p>
          {discovery.isLoadingGroups ? (
            <EmptyGroups>載入中...</EmptyGroups>
          ) : discovery.filteredGroups.length === 0 ? (
            <EmptyGroups>目前沒有揪人，試著調整篩選條件或換個課程看看。</EmptyGroups>
          ) : (
            <div className="space-y-4">
              {discovery.filteredGroups.map((group) => (
                <GroupCard
                  key={group.group_id}
                  group={group}
                  course={discovery.courseById.get(group.course_id)}
                  studentId={studentId}
                  message={discovery.messageByGroupId[group.group_id] || ""}
                  canApply={discovery.canApply(group)}
                  buttonLabel={discovery.getButtonLabel(group)}
                  isSubmitting={discovery.isSubmittingGroupId === group.group_id}
                  isUpdating={discovery.isUpdatingGroupId === group.group_id}
                  onMessageChange={(message) =>
                    discovery.setMessageByGroupId((current) => ({
                      ...current,
                      [group.group_id]: message,
                    }))
                  }
                  onApply={() => discovery.applyToGroup(group)}
                  onToggleRecruitment={() => discovery.toggleRecruitment(group)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyGroups({ children }: { children: React.ReactNode }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="px-6 py-12 text-center text-slate-500">
        <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
        {children}
      </CardContent>
    </Card>
  );
}
