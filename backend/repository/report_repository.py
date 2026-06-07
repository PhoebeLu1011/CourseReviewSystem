from models.report import Report


class ReportRepository:
    def __init__(self, db):
        self.collection = db["reports"]

    def find_pending_reports(self):
        """取得所有待審核的檢舉案件，依時間排序"""
        cursor = self.collection.find({"status": "PENDING"}).sort("timestamp", 1)
        reports = []

        for data in cursor:
            reports.append(self._to_report(data))

        return reports

    def find_all_reports(self):
        """取得所有檢舉案件"""
        cursor = self.collection.find().sort("timestamp", -1)
        reports = []

        for data in cursor:
            reports.append(self._to_report(data))

        return reports

    def count_all_reports(self):
        return self.collection.count_documents({})

    def count_by_status(self, status: str):
        return self.collection.count_documents({"status": status})

    def find_by_id(self, report_id: str):
        """取得單一檢舉案件"""
        data = self.collection.find_one({"reportID": report_id})

        if not data:
            return None

        return self._to_report(data)

    def find_by_reporter(self, reporter_id: str):
        """取得某學生提交的所有檢舉"""
        cursor = self.collection.find({"reporterID": reporter_id}).sort("timestamp", -1)
        reports = []

        for data in cursor:
            reports.append(self._to_report(data))

        return reports

    def save(self, report: Report):
        """新增或更新檢舉案件"""
        self.collection.update_one(
            {"reportID": report.reportID},
            {"$set": report.to_dict()},
            upsert=True,
        )

    def insert_if_absent(self, report: Report):
        result = self.collection.update_one(
            {
                "reporterID": report.reporterID,
                "reported_type": report.reported_type,
                "reported_id": report.reported_id,
            },
            {"$setOnInsert": report.to_dict()},
            upsert=True,
        )
        return result.upserted_id is not None

    @staticmethod
    def _to_report(data):
        if not data:
            return None
        data = dict(data)
        data.pop("_id", None)
        return Report(**data)
