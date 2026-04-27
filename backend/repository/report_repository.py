class ReportRepository:
    def __init__ (self, db):
        self.collection = db["reports"]
    
    def find_pending_reports(self):
        return list(self.collection.find({"status": "pending"}).sort("timestamp", 1))
    
    def update_status(self, report_id, status):
        self.collection.update_one(
            {"reportID": report_id},
            {"$set": {"status": status}}
        )
