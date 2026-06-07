from dataclasses import dataclass


@dataclass(frozen=True)
class AdminAnalyticsSummary:
    pending_reports: int
    total_reports: int
    active_announcements: int

    def to_dict(self):
        return {
            "pendingReports": self.pending_reports,
            "totalReports": self.total_reports,
            "activeAnnouncements": self.active_announcements,
        }


class AdminAnalyticsService:
    """Builds admin dashboard read models without leaking aggregate lists to the UI."""

    def __init__(self, report_repo, announcement_repo):
        self.report_repo = report_repo
        self.announcement_repo = announcement_repo

    def get_summary(self) -> AdminAnalyticsSummary:
        return AdminAnalyticsSummary(
            pending_reports=self.report_repo.count_by_status("PENDING"),
            total_reports=self.report_repo.count_all_reports(),
            active_announcements=self.announcement_repo.count_active(),
        )
