from models.notification import Notification
from pymongo import ReturnDocument


class NotificationRepository:
    def __init__(self, db):
        self.collection = db["notifications"]

    def find_by_id(self, notification_id: str) -> Notification | None:
        data = self.collection.find_one({"notification_id": notification_id})
        return self._to_notification(data)

    def save(self, notification: Notification) -> None:
        self.collection.update_one(
            {"notification_id": notification.notification_id},
            {"$set": notification.to_dict()},
            upsert=True,
        )

    def find_by_receiver(self, receiver_id: str) -> list[Notification]:
        cursor = self.collection.find(
            {"receiver_id": receiver_id}
        ).sort("created_at", -1)

        return [self._to_notification(data) for data in cursor]

    def find_unread_by_receiver(self, receiver_id: str) -> list[Notification]:
        cursor = self.collection.find(
            {
                "receiver_id": receiver_id,
                "is_read": False,
            }
        ).sort("created_at", -1)

        return [self._to_notification(data) for data in cursor]

    def mark_as_read_by_receiver(
        self,
        notification_id: str,
        receiver_id: str,
    ) -> Notification | None:
        data = self.collection.find_one_and_update(
            {
                "notification_id": notification_id,
                "receiver_id": receiver_id,
            },
            {"$set": {"is_read": True}},
            return_document=ReturnDocument.AFTER,
        )
        return self._to_notification(data)

    @staticmethod
    def _to_notification(data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Notification(**data)
