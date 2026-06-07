import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, Users, X } from "lucide-react";

import {
  approveApplication,
  cancelApplication,
  rejectApplication,
} from "../../api/applicationApi";
import {
  closeGroup,
  dissolveGroup,
  editGroup,
  getMyGroupDashboard,
  leaveGroup,
  removeGroupMember,
  reopenGroup,
  transferGroupLeadership,
} from "../../api/groupApi";
import type { Application, ApplicationStatus } from "../../models/Application";
import type { Group, GroupManagementDashboard } from "../../models/Group";
import { getErrorMessage } from "../../utils/errors";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "審核中",
  approved: "已核准",
  rejected: "已拒絕",
  cancelled: "已取消",
};

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-500",
};

function EmptyState({ children }: { children: string }) {
  return (
    <Card className="border-dashed border-2 border-slate-200 shadow-none">
      <CardContent className="p-6 text-center text-sm text-slate-500">
        {children}
      </CardContent>
    </Card>
  );
}

function GroupSummary({ group }: { group: Group }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-slate-900">{group.group_name}</h3>
        <Badge variant="outline">
          {group.status === "open" ? "招募中" : "已關閉"}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        課程 {group.course_id} · {group.members.length}/{group.max_members} 人
      </p>
    </div>
  );
}

export function GroupManagementPanel() {
  const [dashboard, setDashboard] = useState<GroupManagementDashboard | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      setDashboard(await getMyGroupDashboard());
      setNotice("");
    } catch (error) {
      setNotice(getErrorMessage(error, "無法載入群組管理資料。"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const runAction = async (
    id: string,
    action: () => Promise<Application | Group>,
    successMessage: string
  ) => {
    setBusyId(id);
    setNotice("");
    try {
      await action();
      await loadDashboard();
      setNotice(successMessage);
    } catch (error) {
      setNotice(getErrorMessage(error, "操作失敗，請稍後再試。"));
    } finally {
      setBusyId(null);
    }
  };

  const handleEditGroup = (group: Group) => {
    const groupName = window.prompt("群組名稱", group.group_name);
    if (groupName === null) return;
    const neededMembersValue = window.prompt(
      "還需要幾位成員？",
      String(group.needed_members ?? Math.max(group.max_members - group.members.length, 0))
    );
    if (neededMembersValue === null) return;
    const neededMembers = Number(neededMembersValue);
    if (!Number.isInteger(neededMembers) || neededMembers < 0) {
      setNotice("需要人數必須是大於或等於 0 的整數。");
      return;
    }
    runAction(
      group.group_id,
      () =>
        editGroup(group.group_id, {
          group_name: groupName,
          needed_members: neededMembers,
        }),
      "群組資料已更新。"
    );
  };

  const handleTransferLeadership = (group: Group) => {
    const newLeaderId = window.prompt("輸入新隊長的學生 ID");
    if (!newLeaderId?.trim()) return;
    runAction(
      group.group_id,
      () => transferGroupLeadership(group.group_id, newLeaderId.trim()),
      "隊長已轉移。"
    );
  };

  const handleDissolveGroup = (group: Group) => {
    if (!window.confirm(`確定要解散「${group.group_name}」嗎？`)) return;
    runAction(
      group.group_id,
      () => dissolveGroup(group.group_id),
      "群組已解散。"
    );
  };

  const handleLeaveGroup = (group: Group) => {
    if (!window.confirm(`確定要退出「${group.group_name}」嗎？`)) return;
    runAction(
      group.group_id,
      () => leaveGroup(group.group_id),
      "已退出群組。"
    );
  };

  if (loading && !dashboard) {
    return <p className="py-8 text-center text-sm text-slate-500">載入中...</p>;
  }

  return (
    <div className="space-y-8">
      {notice && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {notice}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">我管理的群組</h2>
            <p className="text-sm text-slate-500">管理招募狀態與待審申請。</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboard} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            重新整理
          </Button>
        </div>

        {!dashboard?.led_groups.length ? (
          <EmptyState>你目前沒有擔任任何群組的隊長。</EmptyState>
        ) : (
          dashboard.led_groups.map(({ group, pending_applications }) => (
            <Card key={group.group_id} className="border-slate-100 shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <GroupSummary group={group} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === group.group_id}
                      onClick={() => handleEditGroup(group)}
                    >
                      編輯
                    </Button>
                    {group.members.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === group.group_id}
                        onClick={() => handleTransferLeadership(group)}
                      >
                        轉移隊長
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === group.group_id}
                      onClick={() =>
                        runAction(
                          group.group_id,
                          () =>
                            group.status === "open"
                              ? closeGroup(group.group_id)
                              : reopenGroup(group.group_id),
                          group.status === "open" ? "招募已關閉。" : "招募已重新開啟。"
                        )
                      }
                    >
                      {group.status === "open" ? "關閉招募" : "重新招募"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={busyId === group.group_id}
                      onClick={() => handleDissolveGroup(group)}
                    >
                      解散
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-700">
                    現有成員 ({group.members.length})
                  </h4>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {group.members.map((memberId) => (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                      >
                        <span>
                          {memberId}
                          {memberId === group.leader_id ? "（隊長）" : ""}
                        </span>
                        {memberId !== group.leader_id && (
                          <button
                            type="button"
                            className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                            disabled={busyId === memberId}
                            aria-label={`移除成員 ${memberId}`}
                            onClick={() =>
                              runAction(
                                memberId,
                                () => removeGroupMember(group.group_id, memberId),
                                "成員已移除。"
                              )
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <h4 className="mb-3 text-sm font-bold text-slate-700">
                    待審申請 ({pending_applications.length})
                  </h4>
                  {!pending_applications.length ? (
                    <p className="text-sm text-slate-400">目前沒有待審申請。</p>
                  ) : (
                    <div className="space-y-3">
                      {pending_applications.map((application) => (
                        <div
                          key={application.application_id}
                          className="flex flex-col justify-between gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {application.student_id}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {application.message || "未附申請訊息"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={busyId === application.application_id}
                              onClick={() =>
                                runAction(
                                  application.application_id,
                                  () => approveApplication(application.application_id),
                                  "已核准申請。"
                                )
                              }
                            >
                              <Check />
                              核准
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busyId === application.application_id}
                              onClick={() =>
                                runAction(
                                  application.application_id,
                                  () => rejectApplication(application.application_id),
                                  "已拒絕申請。"
                                )
                              }
                            >
                              <X />
                              拒絕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">我加入的群組</h2>
          <p className="text-sm text-slate-500">已核准加入且由其他同學帶領的群組。</p>
        </div>
        {!dashboard?.member_groups.length ? (
          <EmptyState>你目前尚未加入其他群組。</EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {dashboard.member_groups.map((group) => (
              <Card key={group.group_id} className="border-slate-100 shadow-sm">
                <CardContent className="p-5">
                  <GroupSummary group={group} />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      隊長：{group.leader_id}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === group.group_id}
                      onClick={() => handleLeaveGroup(group)}
                    >
                      退出群組
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="text-slate-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">我的申請紀錄</h2>
            <p className="text-sm text-slate-500">查看申請目前的處理狀態。</p>
          </div>
        </div>
        {!dashboard?.applications.length ? (
          <EmptyState>你目前尚未送出任何入組申請。</EmptyState>
        ) : (
          <div className="space-y-3">
            {dashboard.applications.map((application) => (
              <Card key={application.application_id} className="border-slate-100 shadow-sm">
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-bold text-slate-900">
                      群組 {application.group_id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      課程 {application.course_id || "未知"} · {application.message || "未附申請訊息"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLE[application.status]}
                    >
                      {STATUS_LABEL[application.status]}
                    </Badge>
                    {application.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === application.application_id}
                        onClick={() =>
                          runAction(
                            application.application_id,
                            () => cancelApplication(application.application_id),
                            "申請已取消。"
                          )
                        }
                      >
                        取消申請
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
