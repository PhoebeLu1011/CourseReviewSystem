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


def create_application_routes(application_service, authorization_service):
    application_bp = Blueprint("applications", __name__)

    @application_bp.route("/applications", methods=["POST"])
    @authorization_service.require_student
    def submit_application():
        try:
            data = request.get_json() or {}

            group_id = data.get("group_id")
            message = data.get("message", "")

            result = application_service.submit_application(
                student_id=authorization_service.current_student_id(),
                group_id=group_id,
                message=message,
            )

            return jsonify(result.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    @application_bp.route("/applications/<application_id>/approve", methods=["POST"])
    @authorization_service.require_student
    def approve_application(application_id):
        try:
            application = application_service.approve_application(
                application_id=application_id,
                leader_id=authorization_service.current_student_id(),
            )

            return jsonify(application.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    @application_bp.route("/applications/<application_id>/reject", methods=["POST"])
    @authorization_service.require_student
    def reject_application(application_id):
        try:
            application = application_service.reject_application(
                application_id=application_id,
                leader_id=authorization_service.current_student_id(),
            )

            return jsonify(application.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    @application_bp.route("/applications/<application_id>/cancel", methods=["POST"])
    @authorization_service.require_student
    def cancel_application(application_id):
        try:
            application = application_service.cancel_application(
                application_id=application_id,
                student_id=authorization_service.current_student_id(),
            )

            return jsonify(application.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    @application_bp.route("/groups/<group_id>/applications/pending", methods=["GET"])
    @authorization_service.require_student
    def list_pending_applications_for_group(group_id):
        try:
            applications = application_service.list_pending_applications_for_group(
                group_id=group_id,
                leader_id=authorization_service.current_student_id(),
            )

            return jsonify([app.to_dict() for app in applications]), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    @application_bp.route("/students/<student_id>/applications/pending", methods=["GET"])
    @authorization_service.require_student
    def list_pending_applications_for_student(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        applications = application_service.list_pending_applications_for_student(
            student_id=student_id
        )

        return jsonify([app.to_dict() for app in applications]), 200

    return application_bp
