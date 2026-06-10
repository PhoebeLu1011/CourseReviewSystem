from datetime import datetime


NOTIFICATION_TEMPLATES = {
    "application_submitted": "有新的加入申請送至你的揪人貼文。",
    "application_approved": "你的申請已通過審核。",
    "application_rejected": "你的申請已被拒絕。",
    "group_full_auto_rejected": "由於揪人已滿員，你的申請已自動被拒絕。",
    "group_full_recruitment_closed": "你的揪人已滿員，招募已自動關閉。",
}


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
        receiver_id = str(receiver_id).strip() if receiver_id is not None else ""
        content = str(content).strip() if content is not None else ""
        type = str(type).strip() if type is not None else ""

        if not receiver_id:
            raise ValueError("receiver_id is required.")
        if not content:
            raise ValueError("content cannot be empty.")
        if not type:
            raise ValueError("type cannot be empty.")

        if not notification_id:
            raise ValueError("notification_id is required.")

        self.notification_id = str(notification_id)
        self.receiver_id = receiver_id
        self.content = content
        self.type = type
        self.is_read = bool(is_read)
        self.created_at = created_at or datetime.now()
        self.related_id = str(related_id).strip() if related_id else None

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


def create_notification_from_event(
    event_type: str,
    notification_id: str,
    receiver_id: str,
    related_id: str | None = None,
):
    content = NOTIFICATION_TEMPLATES.get(event_type)
    if not content:
        raise ValueError(f"Unsupported notification event: {event_type}")

    return Notification(
        notification_id=notification_id,
        receiver_id=receiver_id,
        content=content,
        type=event_type,
        related_id=related_id,
    )
