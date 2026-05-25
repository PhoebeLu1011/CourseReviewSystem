from repository.report_repository import ReportRepository
from repository.review_repository import ReviewRepository
from datetime import datetime

class AdminService:
    def __init__(self, report_repo: ReportRepository, review_repo: ReviewRepository):
        self.report_repo = report_repo
        self.review_repo = review_repo
##
    def get_report_queue(self):
        """取得所有待處理的檢舉案件"""
        return self.report_repo.find_pending_reports()

    def process_report(self, report_id: str, decision: str, handler_id: str, resolution: str = None):
        """管理員處理檢舉案件"""
        report = self.report_repo.find_by_id(report_id)
        if not report:
            raise ValueError("Report not found.")

        if decision == "DELETE_REVIEW":
            # 刪除被檢舉的評價
            self.review_repo.delete_by_id(report.reviewID)
            self.report_repo.update_status(report_id, "RESOLVED", handler_id, "deleted")

        elif decision == "HIDE_REVIEW":
            # 隱藏評價（如果有這個功能）
            self.review_repo.reset_visibility(report.reviewID)  # 或其他隱藏方法
            self.report_repo.update_status(report_id, "RESOLVED", handler_id, "hidden")

        elif decision == "DISMISS_REPORT":
            # 駁回檢舉
            self.report_repo.update_status(report_id, "DISMISSED", handler_id, "dismissed")
            # 可選擇是否重置 visibility

        else:
            raise ValueError("Invalid decision")

        return report

##
