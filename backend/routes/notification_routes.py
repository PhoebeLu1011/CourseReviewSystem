"""
GET  /students/<student_id>/notifications
GET  /students/<student_id>/notifications/unread
POST /notifications/<notification_id>/read
"""
from flask import Blueprint, jsonify

def create_notification_routes(notification_service, authorization_service):
    notification_bp = Blueprint("notifications", __name__)

    @notification_bp.errorhandler(PermissionError)
    def handle_permission_error(error):
        return jsonify({"message": str(error)}), 403

    @notification_bp.errorhandler(ValueError)
    def handle_value_error(error):
        status = 404 if "not found" in str(error).lower() else 400
        return jsonify({"message": str(error)}), status

    @notification_bp.route("/students/<student_id>/notifications", methods=["GET"])
    @authorization_service.require_student
    def list_notifications(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        notifications = notification_service.list_notifications_for_user(student_id)

        return jsonify([n.to_dict() for n in notifications]), 200

    @notification_bp.route("/students/<student_id>/notifications/unread", methods=["GET"])
    @authorization_service.require_student
    def list_unread_notifications(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        notifications = notification_service.list_unread_notifications_for_user(student_id)

        return jsonify([n.to_dict() for n in notifications]), 200

    @notification_bp.route("/notifications/<notification_id>/read", methods=["POST"])
    @authorization_service.require_student
    def mark_notification_as_read(notification_id):
        notification = notification_service.mark_as_read(
            notification_id=notification_id,
            user_id=authorization_service.current_student_id(),
        )
        return jsonify(notification.to_dict()), 200

    return notification_bp
