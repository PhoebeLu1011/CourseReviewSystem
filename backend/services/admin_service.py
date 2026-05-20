from repository.report_repository import ReportRepository
from repository.review_repository import ReviewRepository

class AdminService:
    def __init__(self, report_repo: ReportRepository, review_repo: ReviewRepository):
        self.report_repo = report_repo
        self.review_repo = review_repo  
    
    def get_report_queue(self):
        return self.report_repo.find_pending_reports()
    
    def process_report(self, report_id, target_review_id, decision):

        if decision == "DELETE_REVIEW":
            self.review_repo.delete_by_id(target_review_id)
            self.report_repo.update_status(report_id, "RESOLVED")
        
        elif decision == "DISMISS_REPORT":
            self.report_repo.update_status(report_id, "DISMISSED")
            self.review_repo.reset_visibility(target_review_id)
            return "Report dismissed and review visibility reset."
    
        return "invalid decision"