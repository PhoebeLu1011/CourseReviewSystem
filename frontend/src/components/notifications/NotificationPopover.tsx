import { Bell, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useNotifications } from "../../hooks/useNotifications";
import type { Notification } from "../../models/Notification";

type NotificationPopoverProps = {
  studentId?: string;
};

function formatNotificationTime(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationLabel(type: string) {
  return type
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (notificationId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!notification.is_read) onRead(notification.notification_id);
      }}
      className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
          notification.is_read ? "bg-slate-300" : "bg-primary"
        }`}
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {getNotificationLabel(notification.type)}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatNotificationTime(notification.created_at)}
          </span>
        </span>

        <span className="mt-1 block text-sm font-medium leading-snug text-foreground">
          {notification.content}
        </span>
      </span>
    </button>
  );
}

export function NotificationPopover({ studentId }: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    errorMsg,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications(studentId);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) void refresh();
        }}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">通知</h2>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "最新"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              將全部標為已讀
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                載入中...
              </div>
            ) : errorMsg ? (
              <div className="px-4 py-8 text-center text-sm text-rose-600">
                {errorMsg}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                尚未有通知
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  onRead={(notificationId) => void markAsRead(notificationId)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
