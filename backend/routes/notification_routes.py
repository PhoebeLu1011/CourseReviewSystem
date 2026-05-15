"""
GET  /students/<student_id>/notifications
GET  /students/<student_id>/notifications/unread
POST /notifications/<notification_id>/read
"""
from flask import Blueprint, request, jsonify

def create_notification_routes(notification_service):
    notification_bp = Blueprint("notifications", __name__)

    @notification_bp.route("/students/<student_id>/notifications", methods=["GET"])
    def list_notifications(student_id):
        notifications = notification_service.list_notifications_for_user(student_id)

        return jsonify([n.to_dict() for n in notifications]), 200

    @notification_bp.route("/students/<student_id>/notifications/unread", methods=["GET"])
    def list_unread_notifications(student_id):
        notifications = notification_service.list_unread_notifications_for_user(student_id)

        return jsonify([n.to_dict() for n in notifications]), 200

    @notification_bp.route("/notifications/<notification_id>/read", methods=["POST"])
    def mark_notification_as_read(notification_id):
        try:
            data = request.get_json()
            user_id = data.get("user_id")

            notification = notification_service.mark_as_read(
                notification_id=notification_id,
                user_id=user_id,
            )

            return jsonify(notification.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    return notification_bp