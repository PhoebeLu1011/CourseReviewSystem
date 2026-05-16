from datetime import datetime

class Notification:
    def __init__(
        self,
        notification_id: str,
        receiver_id: str,
        content: str,
        type: str,
        is_read: bool = False,
        created_at: datetime | None = None,
        related_id: str | None = None,
    ):
        if not receiver_id:
            raise ValueError("receiver_id is required.")
        if not content or not content.strip():
            raise ValueError("content cannot be empty.")
        if not type or not type.strip():
            raise ValueError("type cannot be empty.")

        self.notification_id = notification_id
        self.receiver_id = receiver_id
        self.content = content.strip()
        self.type = type.strip()
        self.is_read = is_read
        self.created_at = created_at or datetime.now()
        self.related_id = related_id

    def mark_as_read(self) -> None:
        self.is_read = True

    def to_dict(self) -> dict:
        return {
            "notification_id": self.notification_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at,
            "related_id": self.related_id,
        }