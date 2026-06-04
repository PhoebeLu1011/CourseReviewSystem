"""
GET    /admin/reports                       - 取得所有待處理的檢舉案件
GET    /admin/reports/all                   - 取得所有案件（含已處理）
POST   /admin/reports/<report_id>/resolve   - 管理員處理檢舉案件
GET    /admin/announcements                 - 取得所有公告
POST   /admin/announcements                 - 發佈新公告
PUT    /admin/announcements/<id>            - 更新公告
DELETE /admin/announcements/<id>            - 刪除公告
"""

from flask import Blueprint, request, jsonify
from mongo import db


def create_admin_routes(admin_service, announcement_service):
    admin_bp = Blueprint("admin", __name__)

    # ====================== UC9：審核檢舉 ======================

    @admin_bp.route("/admin/reports", methods=["GET"])
    def get_reports():
        """取得所有待處理的檢舉案件"""
        try:
            reports = admin_service.get_report_queue()
            return jsonify([r.to_dict() for r in reports]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/reports/all", methods=["GET"])
    def get_all_reports():
        """取得所有案件（包含已處理與駁回）"""
        try:
            reports = admin_service.get_all_reports()
            return jsonify([r.to_dict() for r in reports]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/reports/<report_id>/content", methods=["GET"])
    def get_report_content(report_id):
        """取得被檢舉內容（依 reported_type 查對應 collection）"""
        try:
            report_data = db["reports"].find_one({"reportID": report_id}, {"_id": 0})
            if not report_data:
                return jsonify({"message": "Report not found"}), 404

            reported_type = report_data.get("reported_type", "review")
            reported_id = report_data.get("reported_id") or report_data.get("reviewID")

            if reported_type == "review":
                content = db["reviews"].find_one({"reviewID": reported_id}, {"_id": 0})
            elif reported_type == "comment":
                content = db["replies"].find_one({"replyID": reported_id}, {"_id": 0})
                if not content:
                    content = db["replies"].find_one({"_id": reported_id}, {"_id": 0})
            elif reported_type == "teammate_post":
                content = db["groups"].find_one({"group_id": reported_id}, {"_id": 0})
            else:
                content = None

            if not content:
                return jsonify({"message": "Content not found", "reported_type": reported_type, "reported_id": reported_id}), 404

            return jsonify({"reported_type": reported_type, "content": content}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/reports/<report_id>/resolve", methods=["POST"])
    def resolve_report(report_id):
        """管理員處理檢舉案件"""
        try:
            data = request.get_json()
            decision = data.get("decision")
            handler_id = data.get("handler_id")
            resolution = data.get("resolution")

            if not decision:
                return jsonify({"message": "decision is required."}), 400

            report = admin_service.process_report(report_id, decision, handler_id, resolution)
            return jsonify({"message": "處理成功", "report": report.to_dict()}), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    # ====================== UC10：發佈公告 ======================

    @admin_bp.route("/admin/announcements", methods=["GET"])
    def get_announcements():
        """取得所有公告"""
        try:
            announcements = announcement_service.get_all_announcements()
            return jsonify([a.to_dict() for a in announcements]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/announcements", methods=["POST"])
    def create_announcement():
        """發佈新公告"""
        try:
            data = request.get_json()
            if not data.get("title") or not data.get("content"):
                return jsonify({"message": "title and content are required."}), 400

            announcement = announcement_service.create_announcement(
                title=data["title"],
                content=data["content"],
                tags=data.get("tags"),
                target=data.get("target", "all"),
                is_pinned=data.get("is_pinned", False),
                scheduled_at=data.get("scheduled_at"),
                created_by=data.get("created_by")
            )
            return jsonify({"message": "公告發布成功", "announcement": announcement.to_dict()}), 201

        except Exception as e:
            return jsonify({"message": str(e)}), 400

    @admin_bp.route("/admin/announcements/<announcement_id>", methods=["PUT"])
    def update_announcement(announcement_id):
        """更新公告內容"""
        try:
            data = request.get_json()
            announcement = announcement_service.update_announcement(announcement_id, **data)
            return jsonify({"message": "公告更新成功", "announcement": announcement.to_dict()}), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 404
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/announcements/<announcement_id>", methods=["DELETE"])
    def delete_announcement(announcement_id):
        """刪除公告"""
        try:
            announcement_service.delete_announcement(announcement_id)
            return jsonify({"message": "公告已刪除"}), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    return admin_bp
