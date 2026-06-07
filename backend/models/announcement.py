import uuid
from dataclasses import dataclass
from datetime import datetime, timezone


ANNOUNCEMENT_TARGETS = {"all", "student", "admin"}
ANNOUNCEMENT_VISIBILITY_STATES = {"VISIBLE", "DELETED"}


def parse_datetime(value, field_name):
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as error:
            raise ValueError(f"{field_name} must be a valid ISO datetime.") from error
    else:
        raise ValueError(f"{field_name} must be a valid ISO datetime.")

    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


@dataclass(frozen=True)
class AnnouncementQuery:
    target: str | None = None
    published_only: bool = False
    include_deleted: bool = False
    now: datetime | None = None

    def __post_init__(self):
        if self.target and self.target not in ANNOUNCEMENT_TARGETS:
            raise ValueError("Invalid announcement target.")
        object.__setattr__(
            self,
            "now",
            parse_datetime(self.now, "now") or datetime.now(timezone.utc),
        )


class Announcement:
    def __init__(
        self,
        title,
        content,
        announcementID=None,
        tags=None,
        target="all",
        is_pinned=False,
        scheduled_at=None,
        created_by=None,
        created_at=None,
        visibilityState="VISIBLE",
    ):
        self.announcementID = announcementID or str(uuid.uuid4())
        self.title = self._required_text(title, "title")
        self.content = self._required_text(content, "content")
        self.tags = self._normalize_tags(tags)
        self.target = target
        self.is_pinned = bool(is_pinned)
        self.scheduled_at = parse_datetime(scheduled_at, "scheduled_at")
        self.created_by = created_by
        self.created_at = parse_datetime(created_at, "created_at") or datetime.now(timezone.utc)
        self.visibilityState = visibilityState
        self._validate()

    def update(
        self,
        *,
        title=None,
        content=None,
        tags=None,
        target=None,
        is_pinned=None,
        scheduled_at=None,
    ):
        if self.visibilityState == "DELETED":
            raise ValueError("Deleted announcements cannot be edited.")
        if title is not None:
            self.title = self._required_text(title, "title")
        if content is not None:
            self.content = self._required_text(content, "content")
        if tags is not None:
            self.tags = self._normalize_tags(tags)
        if target is not None:
            self.target = target
        if is_pinned is not None:
            self.is_pinned = bool(is_pinned)
        if scheduled_at is not None:
            self.scheduled_at = parse_datetime(scheduled_at, "scheduled_at")
        self._validate()

    def is_published(self, now=None):
        now = parse_datetime(now, "now") or datetime.now(timezone.utc)
        return (
            self.visibilityState == "VISIBLE"
            and (self.scheduled_at is None or self.scheduled_at <= now)
        )

    def mark_deleted(self):
        if self.visibilityState == "DELETED":
            raise ValueError("Announcement is already deleted.")
        self.visibilityState = "DELETED"

    def _validate(self):
        if self.target not in ANNOUNCEMENT_TARGETS:
            raise ValueError("Invalid announcement target.")
        if self.visibilityState not in ANNOUNCEMENT_VISIBILITY_STATES:
            raise ValueError("Invalid announcement visibilityState.")

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()

    @staticmethod
    def _normalize_tags(tags):
        if tags is None:
            return []
        if not isinstance(tags, list):
            raise ValueError("tags must be a list.")
        return list(dict.fromkeys(str(tag).strip() for tag in tags if str(tag).strip()))

    def to_dict(self):
        return {
            "announcementID": self.announcementID,
            "title": self.title,
            "content": self.content,
            "tags": self.tags,
            "target": self.target,
            "is_pinned": self.is_pinned,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat(),
            "visibilityState": self.visibilityState,
        }
