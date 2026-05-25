"""
POST /reports                - 學生提交檢舉
GET  /reports/pending        - 取得待審核檢舉清單（Admin）
"""
from flask import Blueprint, request, jsonify
from models.report import ReportReason


def create_report_routes(report_service):
    report_bp = Blueprint("reports", __name__)

    @report_bp.route("/reports", methods=["POST"])
    def submit_report():
        try:
            data = request.get_json()
            reporter_id = data.get("reporterID")
            review_id = data.get("reviewID")
            reason = data.get("reason")

            if not all([reporter_id, review_id, reason]):
                return jsonify({"message": "reporterID, reviewID, and reason are required."}), 400

            if reason not in [r.value for r in ReportReason]:
                return jsonify({"message": f"Invalid reason. Must be one of: {[r.value for r in ReportReason]}"}), 400

            report = report_service.submit_report(
                reporterID=reporter_id,
                reviewID=review_id,
                reason=reason
            )

            if not report:
                return jsonify({"message": "You have already reported this review."}), 409

            return jsonify(report.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @report_bp.route("/reports/pending", methods=["GET"])
    def get_pending_reports():
        reports = report_service.get_pending_reports()
        return jsonify(reports), 200

    return report_bp
