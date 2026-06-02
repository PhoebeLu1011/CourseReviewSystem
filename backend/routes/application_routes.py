"""
Routes for application-related actions.

POST /applications
POST /applications/<application_id>/approve
POST /applications/<application_id>/reject
POST /applications/<application_id>/cancel
GET  /groups/<group_id>/applications/pending
GET  /students/<student_id>/applications/pending
"""

from flask import Blueprint, request, jsonify


def create_application_routes(application_service):
    application_bp = Blueprint("applications", __name__)

    @application_bp.route("/applications", methods=["POST"])
    def submit_application():
        try:
            data = request.get_json()

            student_id = data.get("student_id")
            group_id = data.get("group_id")
            message = data.get("message", "")

            application = application_service.submit_application(
                student_id=student_id,
                group_id=group_id,
                message=message,
            )

            return jsonify(application.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @application_bp.route("/applications/<application_id>/approve", methods=["POST"])
    def approve_application(application_id):
        try:
            data = request.get_json()
            leader_id = data.get("leader_id")

            application = application_service.approve_application(
                application_id=application_id,
                leader_id=leader_id,
            )

            return jsonify(application.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @application_bp.route("/applications/<application_id>/reject", methods=["POST"])
    def reject_application(application_id):
        try:
            data = request.get_json()
            leader_id = data.get("leader_id")

            application = application_service.reject_application(
                application_id=application_id,
                leader_id=leader_id,
            )

            return jsonify(application.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @application_bp.route("/applications/<application_id>/cancel", methods=["POST"])
    def cancel_application(application_id):
        try:
            data = request.get_json()
            student_id = data.get("student_id")

            application = application_service.cancel_application(
                application_id=application_id,
                student_id=student_id,
            )

            return jsonify(application.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @application_bp.route("/groups/<group_id>/applications/pending", methods=["GET"])
    def list_pending_applications_for_group(group_id):
        try:
            leader_id = request.args.get("leader_id")

            applications = application_service.list_pending_applications_for_group(
                group_id=group_id,
                leader_id=leader_id,
            )

            return jsonify([app.to_dict() for app in applications]), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @application_bp.route("/students/<student_id>/applications/pending", methods=["GET"])
    def list_pending_applications_for_student(student_id):
        applications = application_service.list_pending_applications_for_student(
            student_id=student_id
        )

        return jsonify([app.to_dict() for app in applications]), 200

    return application_bp