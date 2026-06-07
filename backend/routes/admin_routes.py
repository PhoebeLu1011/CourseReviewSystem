"""
GET    /admin/reports                       - 取得所有待處理的檢舉案件
GET    /admin/reports/all                   - 取得所有案件，含已處理
GET    /admin/analytics/summary             - 取得管理端統計 summary
GET    /admin/reports/<report_id>/content   - 取得被檢舉內容
POST   /admin/reports/<report_id>/resolve   - 管理員處理檢舉案件
GET    /admin/announcements                 - 取得所有公告
POST   /admin/announcements                 - 發佈新公告
PUT    /admin/announcements/<id>            - 更新公告
DELETE /admin/announcements/<id>            - 刪除公告
"""

from flask import Blueprint, request, jsonify

def create_admin_routes(
    admin_service,
    announcement_service,
    authorization_service,
    admin_analytics_service=None,
):
    admin_bp = Blueprint("admin", __name__)

    # ====================== UC9：審核檢舉 ======================

    @admin_bp.route("/admin/reports", methods=["GET"])
    @authorization_service.require_admin
    def get_reports():
        """取得所有待處理的檢舉案件"""
        try:
            reports = admin_service.get_report_queue()
            return jsonify([report.to_dict() for report in reports]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/reports/all", methods=["GET"])
    @authorization_service.require_admin
    def get_all_reports():
        """取得所有案件，包含已處理與駁回"""
        try:
            reports = admin_service.get_all_reports()
            return jsonify([report.to_dict() for report in reports]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/analytics/summary", methods=["GET"])
    @authorization_service.require_admin
    def get_analytics_summary():
        """取得管理端統計 read model"""
        if admin_analytics_service is None:
            return jsonify({"message": "Admin analytics service is not configured."}), 500

        try:
            summary = admin_analytics_service.get_summary()
            return jsonify(summary.to_dict()), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/reports/<report_id>/content", methods=["GET"])
    @authorization_service.require_admin
    def get_report_content(report_id):
        """取得被檢舉內容"""
        try:
            return jsonify(admin_service.get_report_content(report_id)), 200

        except LookupError as e:
            return jsonify({"message": str(e)}), 404

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/reports/<report_id>/resolve", methods=["POST"])
    @authorization_service.require_admin
    def resolve_report(report_id):
        """管理員處理檢舉案件"""
        try:
            data = request.get_json() or {}

            decision = data.get("decision")
            handler_id = authorization_service.current_identity().subject_id
            resolution = data.get("resolution")

            if not decision:
                return jsonify({"message": "decision is required."}), 400

            report = admin_service.process_report(
                report_id=report_id,
                decision=decision,
                handler_id=handler_id,
                resolution=resolution,
            )

            return jsonify({
                "message": "處理成功",
                "report": report.to_dict(),
            }), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except LookupError as e:
            return jsonify({"message": str(e)}), 404

        except Exception as e:
            return jsonify({"message": str(e)}), 500

    # ====================== UC10：發佈公告 ======================

    @admin_bp.route("/admin/announcements", methods=["GET"])
    @authorization_service.require_admin
    def get_announcements():
        """取得所有公告"""
        try:
            announcements = announcement_service.get_all_announcements()
            return jsonify([a.to_dict() for a in announcements]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/announcements", methods=["POST"])
    @authorization_service.require_admin
    def create_announcement():
        """發佈新公告"""
        try:
            data = request.get_json() or {}

            if not data.get("title") or not data.get("content"):
                return jsonify({"message": "title and content are required."}), 400

            announcement = announcement_service.create_announcement(
                title=data["title"],
                content=data["content"],
                tags=data.get("tags"),
                target=data.get("target", "all"),
                is_pinned=data.get("is_pinned", False),
                scheduled_at=data.get("scheduled_at"),
                created_by=authorization_service.current_identity().subject_id,
            )

            return jsonify({
                "message": "公告發布成功",
                "announcement": announcement.to_dict(),
            }), 201

        except Exception as e:
            return jsonify({"message": str(e)}), 400

    @admin_bp.route("/admin/announcements/<announcement_id>", methods=["PUT"])
    @authorization_service.require_admin
    def update_announcement(announcement_id):
        """更新公告內容"""
        try:
            data = request.get_json() or {}
            announcement = announcement_service.update_announcement(
                announcement_id,
                **data,
            )

            return jsonify({
                "message": "公告更新成功",
                "announcement": announcement.to_dict(),
            }), 200

        except ValueError as e:
            status = 404 if "not found" in str(e).lower() else 400
            return jsonify({"message": str(e)}), status

        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @admin_bp.route("/admin/announcements/<announcement_id>", methods=["DELETE"])
    @authorization_service.require_admin
    def delete_announcement(announcement_id):
        """刪除公告"""
        try:
            announcement_service.delete_announcement(announcement_id)
            return jsonify({"message": "公告已刪除"}), 200

        except ValueError as e:
            status = 404 if "not found" in str(e).lower() else 400
            return jsonify({"message": str(e)}), status

        except Exception as e:
            return jsonify({"message": str(e)}), 500

    return admin_bp
