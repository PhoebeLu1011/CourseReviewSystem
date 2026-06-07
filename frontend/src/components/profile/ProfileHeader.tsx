import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import { BookOpen, Calendar, Camera, Check, Edit2, Hash, X } from "lucide-react";

import { API_BASE_URL } from "../../config/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import type { ProfileEditForm, UserProfileState } from "./profileTypes";

interface ProfileHeaderProps {
  user: UserProfileState;
  editForm: ProfileEditForm;
  isEditing: boolean;
  isLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onEditFormChange: Dispatch<SetStateAction<ProfileEditForm>>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
  user,
  editForm,
  isEditing,
  isLoading,
  fileInputRef,
  onEditFormChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onAvatarChange,
}: ProfileHeaderProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-sm">
      <div className="absolute left-0 top-0 h-28 w-full bg-gradient-to-r from-primary/10 to-transparent" />
      <CardContent className="relative z-10 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-gradient-to-tr from-rose-500 to-amber-400 shadow-md">
            {user.avatar ? (
              <img
                src={`${API_BASE_URL}/api/user/avatar/${user.avatar}`}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full select-none items-center justify-center text-4xl font-black text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isLoading}
              onChange={onAvatarChange}
            />

            {isEditing && (
              <button
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white transition-opacity duration-200"
                title="Upload photo"
                type="button"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={20} />
                <span className="mt-0.5 text-[10px] font-bold">換照片</span>
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(event) =>
                      onEditFormChange((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="text-2xl font-bold"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                )}

                <p className="mt-2 flex items-center gap-2 font-medium text-muted-foreground">
                  <BookOpen size={16} />
                  {user.role === "Admin" ? "管理員" : "學生"} · {user.department}
                </p>
                <p className="mt-1 text-sm font-mono text-muted-foreground">
                  {user.email} · {user.studentID}
                </p>
              </div>

              {!isEditing ? (
                <Button
                  onClick={onStartEdit}
                  variant="outline"
                  className="gap-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 size={16} />
                  編輯個人資料
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={onCancelEdit}
                    variant="ghost"
                    className="gap-2 font-bold text-muted-foreground"
                    disabled={isLoading}
                  >
                    <X size={16} />
                    取消
                  </Button>
                  <Button
                    onClick={onSave}
                    className="gap-2 bg-slate-900 font-bold hover:bg-slate-800"
                    disabled={isLoading}
                  >
                    <Check size={16} />
                    {isLoading ? "儲存中..." : "儲存"}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <ProfileEditFields editForm={editForm} onChange={onEditFormChange} />
            ) : (
              <div className="space-y-3">
                <p className="max-w-3xl font-medium leading-relaxed text-slate-600">
                  {user.bio || "尚未填寫個人簡介。"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.interests.length > 0 ? (
                    user.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-700"
                      >
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs italic text-slate-400">尚未新增興趣。</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileEditFields({
  editForm,
  onChange,
}: {
  editForm: ProfileEditForm;
  onChange: Dispatch<SetStateAction<ProfileEditForm>>;
}) {
  return (
    <div className="grid gap-4 rounded-xl border bg-slate-50/50 p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-bold text-slate-700">個人簡介</label>
        <textarea
          value={editForm.bio}
          onChange={(event) =>
            onChange((current) => ({ ...current, bio: event.target.value }))
          }
          className="min-h-[90px] w-full resize-none rounded-xl border border-slate-300 bg-background p-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
        />
      </div>
      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
          <Calendar size={14} />
          生日
        </label>
        <Input
          type="date"
          value={editForm.birthday}
          className="rounded-xl"
          onChange={(event) =>
            onChange((current) => ({ ...current, birthday: event.target.value }))
          }
        />
      </div>
      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
          <Hash size={14} />
          興趣
        </label>
        <Input
          value={editForm.interests}
          className="rounded-xl"
          onChange={(event) =>
            onChange((current) => ({ ...current, interests: event.target.value }))
          }
          placeholder="例如：Coding, Reading, Sports"
        />
      </div>
    </div>
  );
}
