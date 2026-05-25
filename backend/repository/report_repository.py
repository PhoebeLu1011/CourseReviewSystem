from models.report import Report
from datetime import datetime

class ReportRepository:
    def __init__(self, db):
        self.collection = db["reports"]

    def find_pending_reports(self):
        """取得所有待審核的檢舉案件（依時間排序）"""
        cursor = self.collection.find({"status": "PENDING"}).sort("timestamp", 1)
        return [Report(**data) for data in cursor]

    def find_by_id(self, report_id: str):
        """取得單一檢舉案件"""
        data = self.collection.find_one({"reportID": report_id})
        if not data:
            return None
        data.pop("_id", None)
        return Report(**data)

    def save(self, report: Report):
        """新增或更新檢舉案件"""
        self.collection.update_one(
            {"reportID": report.reportID},
            {"$set": report.to_dict()},
            upsert=True
        )

    def update_status(self, report_id: str, status: str, handler_id: str = None, resolution: str = None):
        """管理員處理檢舉案件"""
        update_data = {
            "status": status,
            "timestamp": datetime.now()   # 使用你們習慣的 timestamp
        }
        if handler_id:
            update_data["handler_id"] = handler_id
        if resolution:
            update_data["resolution"] = resolution

        self.collection.update_one(
            {"reportID": report_id},
            {"$set": update_data}
        )
