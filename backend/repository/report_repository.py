from models.report import Report


class ReportRepository:
    def __init__(self, db):
        self.collection = db["reports"]

    def find_pending_reports(self):
        return list(self.collection.find({"status": "PENDING"}).sort("timestamp", 1))

    def find_by_reporter_and_review(self, reporterID, reviewID):
        return self.collection.find_one({
            "reporterID": reporterID,
            "reviewID": reviewID,
            "status": "PENDING"
        })

    def save(self, report: Report):
        self.collection.update_one(
            {"reportID": report.reportID},
            {"$set": report.to_dict()},
            upsert=True
        )

    def update_status(self, reportID, status):
        self.collection.update_one(
            {"reportID": reportID},
            {"$set": {"status": status}}
        )
