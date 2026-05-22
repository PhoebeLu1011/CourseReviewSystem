from flask import Flask, jsonify, request
from flask_cors import CORS
from db.mongo import db

# ====================== Repositories ======================
from repository.report_repository import ReportRepository
from repository.announcement_repository import AnnouncementRepository
from repository.review_repository import ReviewRepository

# ====================== Services ======================
from services.admin_service import AdminService
from services.announcement_service import AnnouncementService

app = Flask(__name__)
CORS(app)  # 允許 React 前端跨域請求

# ====================== 初始化 ======================
report_repo = ReportRepository(db)
announcement_repo = AnnouncementRepository(db)
review_repo = ReviewRepository(db)

admin_service = AdminService(report_repo, review_repo)
announcement_service = AnnouncementService(announcement_repo)

# ====================== UC9：管理員審核檢舉 ======================
@app.route('/admin/reports', methods=['GET'])
def get_reports():
    """取得所有待處理的檢舉案件"""
    try:
        reports = admin_service.get_report_queue()
        return jsonify([report.to_dict() for report in reports]), 200
    except Exception as e:
        return jsonify({"error": "取得檢舉案件失敗", "message": str(e)}), 500

@app.route('/admin/reports/<report_id>/resolve', methods=['POST'])
def resolve_report(report_id):
    """管理員處理檢舉案件"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "缺少請求資料"}), 400

        decision = data.get('decision')          # "DELETE_REVIEW", "HIDE_REVIEW", "DISMISS_REPORT"
        handler_id = data.get('handler_id')
        resolution = data.get('resolution')

        if not decision or not handler_id:
            return jsonify({"error": "缺少 decision 或 handler_id"}), 400

        report = admin_service.process_report(report_id, decision, handler_id, resolution)
        return jsonify({
            "message": "檢舉處理成功",
            "report": report.to_dict()
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "處理檢舉失敗", "message": str(e)}), 500

# ====================== UC10：管理員發佈公告 ======================
@app.route('/admin/announcements', methods=['GET'])
def get_announcements():
    """取得所有公告"""
    try:
        announcements = announcement_service.get_all_announcements()
        return jsonify([ann.to_dict() for ann in announcements]), 200
    except Exception as e:
        return jsonify({"error": "取得公告失敗", "message": str(e)}), 500

@app.route('/admin/announcements', methods=['POST'])
def create_announcement():
    """發佈新公告"""
    try:
        data = request.get_json()
        if not data or not data.get('title') or not data.get('content'):
            return jsonify({"error": "標題與內容為必填"}), 400

        announcement = announcement_service.create_announcement(
            title=data['title'],
            content=data['content'],
            tags=data.get('tags'),
            target=data.get('target', 'all'),
            is_pinned=data.get('is_pinned', False),
            scheduled_at=data.get('scheduled_at'),
            created_by=data.get('created_by')
        )
        return jsonify({
            "message": "公告發布成功",
            "announcement": announcement.to_dict()
        }), 201

    except Exception as e:
        return jsonify({"error": "發布公告失敗", "message": str(e)}), 500

# ====================== 測試路由 ======================
@app.route('/')
def home():
    return jsonify({
        "message": "CourseReviewSystem Backend 運行中！",
        "status": "OK",
        "admin_api": "UC9 & UC10 已就緒"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
