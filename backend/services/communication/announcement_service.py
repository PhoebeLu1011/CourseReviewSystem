from models.announcement import Announcement, AnnouncementQuery
from repository.announcement_repository import AnnouncementRepository


class AnnouncementService:
    def __init__(self, announcement_repo: AnnouncementRepository):
        self.announcement_repo = announcement_repo

    def create_announcement(
        self,
        title,
        content,
        tags=None,
        target="all",
        is_pinned=False,
        scheduled_at=None,
        created_by=None,
    ):
        announcement = Announcement(
            title=title,
            content=content,
            tags=tags,
            target=target,
            is_pinned=is_pinned,
            scheduled_at=scheduled_at,
            created_by=created_by,
        )
        self.announcement_repo.save(announcement)
        return announcement

    def get_all_announcements(self):
        return self.announcement_repo.find(AnnouncementQuery())

    def get_public_announcements(self):
        return self.announcement_repo.find(
            AnnouncementQuery(target="all", published_only=True)
        )

    def get_announcement_by_id(self, announcement_id):
        announcement = self.announcement_repo.find_by_id(announcement_id)
        if not announcement:
            raise ValueError("Announcement not found.")
        return announcement

    def update_announcement(self, announcement_id, **changes):
        announcement = self.get_announcement_by_id(announcement_id)
        allowed_fields = {
            "title", "content", "tags", "target", "is_pinned", "scheduled_at"
        }
        unknown_fields = set(changes) - allowed_fields
        if unknown_fields:
            raise ValueError(f"Unsupported announcement fields: {sorted(unknown_fields)}")
        announcement.update(**changes)
        self.announcement_repo.save(announcement)
        return announcement

    def delete_announcement(self, announcement_id):
        announcement = self.get_announcement_by_id(announcement_id)
        announcement.mark_deleted()
        self.announcement_repo.save(announcement)
