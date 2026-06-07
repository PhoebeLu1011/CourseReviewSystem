import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getNotifications,
  markNotificationRead,
} from "../api/notificationApi";
import type { Notification } from "../models/Notification";
import { getErrorMessage } from "../utils/errors";

export function useNotifications(studentId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const refresh = useCallback(async () => {
    if (!studentId) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      setNotifications(await getNotifications(studentId));
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "通知載入失敗。"));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setErrorMsg("");

    try {
      const updated = await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.notification_id === notificationId ? updated : notification
        )
      );
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "通知狀態更新失敗。"));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.is_read
    );

    setErrorMsg("");

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          markNotificationRead(notification.notification_id)
        )
      );

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      setErrorMsg(getErrorMessage(error, "通知狀態更新失敗。"));
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    errorMsg,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
