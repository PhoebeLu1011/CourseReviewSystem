import type { Dispatch, SetStateAction } from "react";
import { Edit2, MessageSquare, Save, Trash2 } from "lucide-react";

import type { Discussion, Reply } from "../../api/discussionApi";
import { formatCourseDisplayCode } from "../../utils/courseDisplay";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import type { DiscussionEditForm } from "./profileTypes";

interface CommunityPanelProps {
  discussions: Discussion[];
  replies: Reply[];
  editingDiscussionId: string | null;
  discussionForm: DiscussionEditForm;
  editingReplyId: string | null;
  replyContent: string;
  onEditingDiscussionChange: (discussionId: string | null) => void;
  onDiscussionFormChange: Dispatch<SetStateAction<DiscussionEditForm>>;
  onUpdateDiscussion: (discussionId: string) => void;
  onDeleteDiscussion: (discussionId: string) => void;
  onEditingReplyChange: (replyId: string | null) => void;
  onReplyContentChange: (content: string) => void;
  onUpdateReply: (replyId: string) => void;
  onDeleteReply: (replyId: string) => void;
}

export function CommunityPanel({
  discussions,
  replies,
  editingDiscussionId,
  discussionForm,
  editingReplyId,
  replyContent,
  onEditingDiscussionChange,
  onDiscussionFormChange,
  onUpdateDiscussion,
  onDeleteDiscussion,
  onEditingReplyChange,
  onReplyContentChange,
  onUpdateReply,
  onDeleteReply,
}: CommunityPanelProps) {
  return (
    <>
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 border-b pb-2 text-xl font-bold text-slate-800">
          <MessageSquare size={20} />
          我的討論
        </h2>
        {discussions.length === 0 ? (
          <p className="text-sm italic text-slate-500">尚未發表討論。</p>
        ) : (
          discussions.map((discussion) => {
            const isEditing = editingDiscussionId === discussion.discussionID;
            return (
              <Card key={discussion.discussionID} className="border-slate-100 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      {isEditing ? (
                        <Input
                          value={discussionForm.title}
                          onChange={(event) =>
                            onDiscussionFormChange((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="mb-2 text-lg font-bold"
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-slate-900">{discussion.title}</h3>
                      )}
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Course: {formatCourseDisplayCode(discussion.courseID)} · {formatDate(discussion.timestamp)}
                      </p>
                    </div>
                    {!isEditing && (
                      <EditActions
                        onEdit={() => {
                          onEditingDiscussionChange(discussion.discussionID);
                          onDiscussionFormChange({
                            title: discussion.title,
                            content: discussion.content,
                          });
                        }}
                        onDelete={() => onDeleteDiscussion(discussion.discussionID)}
                      />
                    )}
                  </div>
                  {isEditing ? (
                    <Editor
                      value={discussionForm.content}
                      onChange={(content) =>
                        onDiscussionFormChange((current) => ({ ...current, content }))
                      }
                      onCancel={() => onEditingDiscussionChange(null)}
                      onSave={() => onUpdateDiscussion(discussion.discussionID)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {discussion.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="space-y-4">
        <h2 className="border-b pb-2 text-xl font-bold text-slate-800">我的回覆</h2>
        {replies.length === 0 ? (
          <p className="text-sm italic text-slate-500">尚未發表回覆。</p>
        ) : (
          replies.map((reply) => {
            const isEditing = editingReplyId === reply.replyID;
            return (
              <Card key={reply.replyID} className="border-slate-100 bg-slate-50/50 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium text-slate-500">
                      Replied on {formatDate(reply.timestamp)}
                    </p>
                    {!isEditing && (
                      <EditActions
                        onEdit={() => {
                          onEditingReplyChange(reply.replyID);
                          onReplyContentChange(reply.content);
                        }}
                        onDelete={() => onDeleteReply(reply.replyID)}
                      />
                    )}
                  </div>
                  {isEditing ? (
                    <Editor
                      value={replyContent}
                      onChange={onReplyContentChange}
                      onCancel={() => onEditingReplyChange(null)}
                      onSave={() => onUpdateReply(reply.replyID)}
                      compact
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{reply.content}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}

function EditActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-700">
        <Edit2 size={16} />
      </button>
      <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function Editor({
  value,
  onChange,
  onCancel,
  onSave,
  compact = false,
}: {
  value: string;
  onChange: (content: string) => void;
  onCancel: () => void;
  onSave: () => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <textarea
        className={`${compact ? "min-h-[60px]" : "min-h-[80px]"} w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>取消</Button>
        <Button size="sm" onClick={onSave} className="bg-slate-900">
          <Save size={14} className="mr-2" />
          儲存
        </Button>
      </div>
    </div>
  );
}

const formatDate = (timestamp?: string) =>
  timestamp ? new Date(timestamp).toLocaleDateString() : "尚無日期";
