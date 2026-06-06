from datetime import datetime
from models.report import Report


class ReportRepository:
    def __init__(self, db):
        self.collection = db["reports"]

    def find_pending_reports(self):
        """取得所有待審核的檢舉案件，依時間排序"""
        cursor = self.collection.find({"status": "PENDING"}).sort("timestamp", 1)
        reports = []

        for data in cursor:
            data.pop("_id", None)
            reports.append(Report(**data))

        return reports

    def find_all_reports(self):
        """取得所有檢舉案件"""
        cursor = self.collection.find().sort("timestamp", -1)
        reports = []

        for data in cursor:
            data.pop("_id", None)
            reports.append(Report(**data))

        return reports

    def find_by_id(self, report_id: str):
        """取得單一檢舉案件"""
        data = self.collection.find_one({"reportID": report_id})

        if not data:
            return None

        data.pop("_id", None)
        return Report(**data)

    def find_by_reporter(self, reporter_id: str):
        """取得某學生提交的所有檢舉"""
        cursor = self.collection.find({"reporterID": reporter_id}).sort("timestamp", -1)
        reports = []

        for data in cursor:
            data.pop("_id", None)
            reports.append(Report(**data))

        return reports

    def find_by_reporter_and_target(
        self,
        reporter_id: str,
        reported_type: str,
        reported_id: str,
    ):
        """檢查同一個學生是否已經檢舉過同一個內容"""
        return self.collection.find_one({
            "reporterID": reporter_id,
            "reported_type": reported_type,
            "reported_id": reported_id,
        })

    def save(self, report: Report):
        """新增或更新檢舉案件"""
        self.collection.update_one(
            {"reportID": report.reportID},
            {"$set": report.to_dict()},
            upsert=True,
        )

    def update_status(
        self,
        report_id: str,
        status: str,
        handler_id: str = None,
        resolution: str = None,
    ):
        """管理員處理檢舉案件"""
        update_data = {
            "status": status,
            "timestamp": datetime.now().isoformat(),
        }

        if handler_id:
            update_data["handler_id"] = handler_id

        if resolution:
            update_data["resolution"] = resolution

        self.collection.update_one(
            {"reportID": report_id},
            {"$set": update_data},
        )

    def withdraw_report(self, report_id: str, reporter_id: str):
        """學生撤回檢舉，只有 PENDING 狀態才可撤回"""
        result = self.collection.update_one(
            {
                "reportID": report_id,
                "reporterID": reporter_id,
                "status": "PENDING",
            },
            {"$set": {"status": "WITHDRAWN"}},
        )

        return result.modified_count > 0