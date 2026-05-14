from repository.announcement_repository import AnnouncementRepository

class AnnouncementService:
    def __init__(self, announcement_repo: AnnouncementRepository):
        self.announcement_repo = announcement_repo

    def create_announcement(self, title: str, content: str, tags=None, target="all",
                            is_pinned=False, scheduled_at=None, created_by=None):
        ""'管理員發布新公告"""
        announcement = Announcement(
            title=title,
            content=content,
            tags=tags,
            target=target,
            is_pinned=is_pinned,
            scheduled_at=scheduled_at,
            created_by=created_by
        )

        self.announcement_repo.save(announcement)
        return announcement

    def get_all_announcements(self):
        """取得所有公告（給前端顯示）"""
        return self.announcement_repo.find_all()

    def delete_announcement(self, announcement_id: str):
        """刪除公告"""
        self.announcement_repo.delete_by_id(announcement_id)
