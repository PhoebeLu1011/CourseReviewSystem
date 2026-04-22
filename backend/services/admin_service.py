from db.mongo import db

reports_collection = db["reports"]
reviews_collection = db["reviews"]

class AdminService:
    
    @staticmethod
    def get_report_queue():
        """
        USE CASE 1: Admin views the queue.
        We simply query the database for all reports that haven't been dealt with.
        """
        # Find all pending reports and sort them by oldest first
        pending_reports = list(reports_collection.find({"status": "PENDING"}).sort("timestamp", 1))
        return pending_reports

    @staticmethod
    def process_report(report_id, target_review_id, decision):
        """
        USE CASE 2: Admin reviews a report in the queue and makes a decision.
        decision should be either "DELETE_REVIEW" or "DISMISS_REPORT"
        """
        if decision == "DELETE_REVIEW":
            # The report was valid. The review broke the rules.
            # 1. Delete the actual review from the platform
            reviews_collection.delete_one({"reviewID": target_review_id})
            
            # 2. Mark the report as resolved so it leaves the queue
            reports_collection.update_one(
                {"reportID": report_id}, 
                {"$set": {"status": "RESOLVED"}}
            )
            return "Review deleted and report resolved."

        elif decision == "DISMISS_REPORT":
            # The report was a false alarm. 
            # 1. Update the report status so it leaves the queue
            reports_collection.update_one(
                {"reportID": report_id}, 
                {"$set": {"status": "DISMISSED"}}
            )
            
            # 2. Reset the visibility of the review back to normal
            reviews_collection.update_one(
                {"reviewID": target_review_id},
                {"$set": {"visibilityState": "VISIBLE", "reportCount": 0}}
            )
            return "Report dismissed. Review is visible again."