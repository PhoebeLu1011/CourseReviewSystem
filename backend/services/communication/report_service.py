from models.report import Report
from repository.report_repository import ReportRepository


class ReportService:
    def __init__(self, report_repo: ReportRepository, target_readers=None):
        self.report_repo = report_repo
        self.target_readers = target_readers or {}

    def submit_report(
        self,
        reporterID: str,
        reported_type: str,
        reported_id: str,
        reason: str,
        description: str = None,
    ):
        report = Report(
            reporterID=reporterID,
            reported_type=reported_type,
            reported_id=reported_id,
            reason=reason,
            description=description,
        )
        self._require_target(report.reported_type, report.reported_id)

        if not self.report_repo.insert_if_absent(report):
            raise ValueError("Content has already been reported by this student.")
        return report

    def get_reports_by_reporter(self, reporter_id: str):
        """取得某學生提交的所有檢舉"""
        return self.report_repo.find_by_reporter(reporter_id)

    def get_pending_reports(self):
        """取得所有待審核檢舉"""
        reports = self.report_repo.find_pending_reports()
        return [report.to_dict() for report in reports]

    def get_report_content_for_reporter(self, report_id, reporter_id):
        report = self.report_repo.find_by_id(report_id)
        if not report:
            raise ValueError("Report not found.")
        if report.reporterID != reporter_id:
            raise PermissionError("Only the reporter can view this report content.")

        target = self._require_target(report.reported_type, report.reported_id)
        return {
            "reported_type": report.reported_type,
            "reported_id": report.reported_id,
            "content": target.to_dict(),
        }

    def withdraw_report(self, report_id: str, reporter_id: str):
        report = self.report_repo.find_by_id(report_id)
        if not report:
            raise ValueError("Report not found.")
        report.withdraw(reporter_id)
        self.report_repo.save(report)
        return True

    def _require_target(self, reported_type, reported_id):
        reader = self.target_readers.get(reported_type)
        if not reader:
            raise ValueError("Unsupported report target type.")
        target = reader(reported_id)
        if not target:
            raise ValueError("Reported content not found.")
        return target
