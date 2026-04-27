import uuid
from models.notification import Notification


class NotificationService:
    def __init__(self, notification_repo):
        self.notification_repo = notification_repo

    def create_notification(
        self,
        receiver_id: str,
        content: str,
        type: str,
        related_id: str | None = None,
    ) -> Notification:
        notification = Notification(
            notification_id=str(uuid.uuid4()),
            receiver_id=receiver_id,
            content=content,
            type=type,
            related_id=related_id,
        )

        self.notification_repo.save(notification)
        return notification

    def mark_as_read(self, notification_id: str, user_id: str) -> Notification:
        notification = self.notification_repo.find_by_id(notification_id)
        if not notification:
            raise ValueError("Notification not found.")

        if notification.receiver_id != user_id:
            raise ValueError("User cannot mark this notification as read.")

        notification.mark_as_read()
        self.notification_repo.save(notification)
        return notification

    def list_notifications_for_user(self, user_id: str) -> list[Notification]:
        return self.notification_repo.find_by_receiver(user_id)

    def list_unread_notifications_for_user(self, user_id: str) -> list[Notification]:
        return self.notification_repo.find_unread_by_receiver(user_id)