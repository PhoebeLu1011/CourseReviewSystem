from models.notification import Notification


class NotificationRepository:
    def __init__(self, db):
        self.collection = db["notifications"]

    def find_by_id(self, notification_id: str) -> Notification | None:
        data = self.collection.find_one({"notification_id": notification_id})
        if not data:
            return None
        return Notification(**data)

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

        return [Notification(**data) for data in cursor]

    def find_unread_by_receiver(self, receiver_id: str) -> list[Notification]:
        cursor = self.collection.find(
            {
                "receiver_id": receiver_id,
                "is_read": False,
            }
        ).sort("created_at", -1)

        return [Notification(**data) for data in cursor]