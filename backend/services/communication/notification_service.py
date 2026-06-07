import uuid
from models.notification import Notification, NotificationFactory


class NotificationService:
    def __init__(self, notification_repo, notification_factory=None):
        self.notification_repo = notification_repo
        self.notification_factory = notification_factory or NotificationFactory(
            lambda: str(uuid.uuid4())
        )

    def publish(
        self,
        event_type: str,
        receiver_id: str,
        related_id: str | None = None,
    ) -> Notification:
        notification = self.notification_factory.create(
            event_type=event_type,
            receiver_id=receiver_id,
            related_id=related_id,
        )
        self.notification_repo.save(notification)
        return notification

    def mark_as_read(self, notification_id: str, user_id: str) -> Notification:
        notification = self.notification_repo.find_by_id(notification_id)
        if not notification:
            raise ValueError("Notification not found.")

        if notification.receiver_id != user_id:
            raise PermissionError("User cannot mark this notification as read.")

        updated = self.notification_repo.mark_as_read_by_receiver(notification_id, user_id)
        if not updated:
            raise ValueError("Notification not found.")
        return updated

    def list_notifications_for_user(self, user_id: str) -> list[Notification]:
        return self.notification_repo.find_by_receiver(user_id)

    def list_unread_notifications_for_user(self, user_id: str) -> list[Notification]:
        return self.notification_repo.find_unread_by_receiver(user_id)


class BestEffortNotificationPublisher:
    """Decorator that keeps secondary notification failures out of core use cases."""

    def __init__(self, notification_service, logger=print):
        self.notification_service = notification_service
        self.logger = logger

    def publish(self, event_type: str, receiver_id: str, related_id: str | None = None):
        try:
            return self.notification_service.publish(event_type, receiver_id, related_id)
        except Exception as error:
            self.logger(f"Notification delivery failed: {error}")
            return None
