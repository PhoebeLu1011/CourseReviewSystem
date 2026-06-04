from models.report import Report, ReportReason
from repository.report_repository import ReportRepository


class ReportService:
    def __init__(self, report_repo: ReportRepository):
        self.report_repo = report_repo

    def submit_report(self, reporterID, reviewID, reason, description=None):
        """學生提交檢舉，若重複則回傳 None"""
        if self.report_repo.find_by_reporter_and_review(reporterID, reviewID):
            return None
        report = Report(
            reviewID=reviewID,
            reporterID=reporterID,
            reason=reason,
            description=description
        )
        self.report_repo.save(report)
        return report

    def get_reports_by_reporter(self, reporter_id: str):
        """取得某學生提交的所有檢舉"""
        return self.report_repo.find_by_reporter(reporter_id)

    def get_pending_reports(self):
        """回傳 dict list（可直接 jsonify）"""
        reports = self.report_repo.find_pending_reports()
        return [r.to_dict() for r in reports]

    def withdraw_report(self, report_id: str, reporter_id: str):
        """學生撤回自己的檢舉"""
        success = self.report_repo.withdraw_report(report_id, reporter_id)
        if not success:
            raise ValueError("Report not found, already processed, or you are not the reporter.")
        return True
