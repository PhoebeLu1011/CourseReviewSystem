"""
POST   /reports                        - 學生提交檢舉
GET    /students/<reporter_id>/reports - 取得某學生提交的所有檢舉
GET    /reports/pending                - 取得待審核檢舉清單
DELETE /reports/<report_id>/withdraw   - 學生撤回自己的檢舉
"""

from flask import Blueprint, request, jsonify
def create_report_routes(report_service, authorization_service):
    report_bp = Blueprint("reports", __name__)

    @report_bp.errorhandler(PermissionError)
    def handle_permission_error(error):
        return jsonify({"message": str(error)}), 403

    @report_bp.errorhandler(ValueError)
    def handle_value_error(error):
        message = str(error)
        if "already been reported" in message:
            return jsonify({"message": message}), 409
        status = 404 if "not found" in message.lower() else 400
        return jsonify({"message": message}), status

    @report_bp.route("/reports", methods=["POST"])
    @authorization_service.require_student
    def submit_report():
        data = request.get_json() or {}
        report = report_service.submit_report(
            reporterID=authorization_service.current_student_id(),
            reported_type=data.get("reported_type"),
            reported_id=data.get("reported_id"),
            reason=data.get("reason"),
            description=data.get("description"),
        )
        return jsonify(report.to_dict()), 201

    @report_bp.route("/students/<reporter_id>/reports", methods=["GET"])
    @authorization_service.require_student
    def get_my_reports(reporter_id):
        """取得某學生提交的所有檢舉"""
        if reporter_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        reports = report_service.get_reports_by_reporter(reporter_id)
        return jsonify([report.to_dict() for report in reports]), 200

    @report_bp.route("/reports/pending", methods=["GET"])
    @authorization_service.require_admin
    def get_pending_reports():
        """取得待審核清單"""
        reports = report_service.get_pending_reports()
        return jsonify(reports), 200

    @report_bp.route("/reports/<report_id>/content", methods=["GET"])
    @authorization_service.require_student
    def get_my_report_content(report_id):
        result = report_service.get_report_content_for_reporter(
            report_id,
            authorization_service.current_student_id(),
        )
        return jsonify(result), 200

    @report_bp.route("/reports/<report_id>/withdraw", methods=["DELETE"])
    @authorization_service.require_student
    def withdraw_report(report_id):
        report_service.withdraw_report(
            report_id,
            authorization_service.current_student_id(),
        )
        return jsonify({"message": "檢舉已撤回"}), 200

    return report_bp
