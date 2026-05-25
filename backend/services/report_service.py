from models.report import Report, ReportReason
from repository.report_repository import ReportRepository


class ReportService:
    def __init__(self, report_repo: ReportRepository):
        self.report_repo = report_repo

    def submit_report(self, reporterID, reviewID, reason):
        if self.report_repo.find_by_reporter_and_review(reporterID, reviewID):
            return None
        report = Report(
            reviewID=reviewID,
            reporterID=reporterID,
            reason=reason
        )
        self.report_repo.save(report)
        return report

    def get_pending_reports(self):
        return self.report_repo.find_pending_reports()
