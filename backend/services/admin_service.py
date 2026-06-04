from repository.report_repository import ReportRepository
from repository.review_repository import ReviewRepository


class AdminService:
    def __init__(self, report_repo: ReportRepository, review_repo: ReviewRepository, course_service=None):
        self.report_repo = report_repo
        self.review_repo = review_repo
        self.course_service = course_service

    def get_report_queue(self):
        """取得所有待處理的檢舉案件"""
        return self.report_repo.find_pending_reports()

    def get_all_reports(self):
        """取得所有案件（含已處理）"""
        return self.report_repo.find_all_reports()

    def process_report(self, report_id: str, decision: str, handler_id: str, resolution: str = None):
        """管理員處理檢舉案件，回傳更新後的 report"""
        report = self.report_repo.find_by_id(report_id)
        if not report:
            raise ValueError("Report not found.")

        if decision == "DELETE_REVIEW":
            # 先取得該評論的課程 ID，刪除後重新計算平均
            review = self.review_repo.find_by_id(report.reviewID)
            course_id = review.courseID if review else None
            self.review_repo.delete_by_id(report.reviewID)
            if course_id and self.course_service:
                try:
                    self.course_service.recalculate_course_ratings(course_id, self.review_repo)
                except Exception as e:
                    print(f"Warning: Could not recalculate ratings: {e}")
            self.report_repo.update_status(report_id, "RESOLVED", handler_id, "deleted")

        elif decision == "HIDE_REVIEW":
            review = self.review_repo.find_by_id(report.reviewID)
            course_id = review.courseID if review else None
            self.review_repo.hide_review(report.reviewID)
            # 隱藏後重新計算（確保從 DELETED 改成 HIDDEN 時評分正確回補）
            if course_id and self.course_service:
                try:
                    self.course_service.recalculate_course_ratings(course_id, self.review_repo)
                except Exception as e:
                    print(f"Warning: Could not recalculate ratings: {e}")
            self.report_repo.update_status(report_id, "RESOLVED", handler_id, "hidden")

        elif decision == "DISMISS_REPORT":
            self.report_repo.update_status(report_id, "DISMISSED", handler_id, "dismissed")

        else:
            raise ValueError("Invalid decision. Must be DELETE_REVIEW, HIDE_REVIEW, or DISMISS_REPORT.")

        # 重新 fetch 以回傳最新狀態
        updated_report = self.report_repo.find_by_id(report_id)
        return updated_report
