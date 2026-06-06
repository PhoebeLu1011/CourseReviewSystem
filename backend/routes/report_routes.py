"""
POST   /reports                        - 學生提交檢舉
GET    /students/<reporter_id>/reports - 取得某學生提交的所有檢舉
GET    /reports/pending                - 取得待審核檢舉清單
DELETE /reports/<report_id>/withdraw   - 學生撤回自己的檢舉
"""

from flask import Blueprint, request, jsonify
from models.report import ReportReason


def create_report_routes(report_service):
    report_bp = Blueprint("reports", __name__)

    @report_bp.route("/reports", methods=["POST"])
    def submit_report():
        try:
            data = request.get_json() or {}

            reporter_id = data.get("reporterID")
            reported_type = data.get("reported_type")
            reported_id = data.get("reported_id")
            reason = data.get("reason")
            description = data.get("description")

            if not all([reporter_id, reported_type, reported_id, reason]):
                return jsonify({
                    "message": "reporterID, reported_type, reported_id, and reason are required."
                }), 400

            allowed_types = ["review", "comment", "teammate_post"]
            if reported_type not in allowed_types:
                return jsonify({
                    "message": f"Invalid reported_type. Must be one of: {allowed_types}"
                }), 400

            allowed_reasons = [reason_enum.value for reason_enum in ReportReason]
            if reason not in allowed_reasons:
                return jsonify({
                    "message": f"Invalid reason. Must be one of: {allowed_reasons}"
                }), 400

            report = report_service.submit_report(
                reporterID=reporter_id,
                reported_type=reported_type,
                reported_id=reported_id,
                reason=reason,
                description=description,
            )

            if not report:
                return jsonify({
                    "message": "You have already reported this content."
                }), 409

            return jsonify(report.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Submit report error:", e)
            return jsonify({"message": "Failed to submit report."}), 500

    @report_bp.route("/students/<reporter_id>/reports", methods=["GET"])
    def get_my_reports(reporter_id):
        """取得某學生提交的所有檢舉"""
        reports = report_service.get_reports_by_reporter(reporter_id)
        return jsonify([report.to_dict() for report in reports]), 200

    @report_bp.route("/reports/pending", methods=["GET"])
    def get_pending_reports():
        """取得待審核清單"""
        reports = report_service.get_pending_reports()
        return jsonify(reports), 200

    @report_bp.route("/reports/<report_id>/withdraw", methods=["DELETE"])
    def withdraw_report(report_id):
        """學生撤回自己的檢舉"""
        try:
            data = request.get_json() or {}
            reporter_id = data.get("reporterID")

            if not reporter_id:
                return jsonify({"message": "reporterID is required."}), 400

            report_service.withdraw_report(report_id, reporter_id)

            return jsonify({"message": "檢舉已撤回"}), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 404

        except Exception as e:
            print("Withdraw report error:", e)
            return jsonify({"message": "Failed to withdraw report."}), 500

    return report_bp