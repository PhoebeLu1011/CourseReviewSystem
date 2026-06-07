from flask import Blueprint, jsonify, request


def create_schedule_routes(schedule_service, authorization_service):
    schedule_bp = Blueprint("schedules", __name__)

    @schedule_bp.errorhandler(ValueError)
    def handle_value_error(error):
        message = str(error)
        status = 404 if "not found" in message.lower() else 400
        return jsonify({"message": message}), status

    @schedule_bp.route("/students/<student_id>/schedule", methods=["GET"])
    @authorization_service.require_student
    def get_schedule(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403
        courses = schedule_service.get_schedule(student_id)
        return jsonify([course.to_dict() for course in courses]), 200

    @schedule_bp.route("/students/<student_id>/schedule", methods=["PUT"])
    @authorization_service.require_student
    def replace_schedule(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403
        data = request.get_json() or {}
        courses = schedule_service.replace_schedule(student_id, data.get("courses", []))
        return jsonify([course.to_dict() for course in courses]), 200

    @schedule_bp.route("/students/<student_id>/schedule", methods=["POST"])
    @authorization_service.require_student
    def add_course(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403
        course = schedule_service.add_course(student_id, request.get_json() or {})
        return jsonify(course.to_dict()), 201

    @schedule_bp.route("/students/<student_id>/schedule/<course_id>", methods=["GET"])
    @authorization_service.require_student
    def check_course(student_id, course_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403
        return jsonify({
            "isScheduled": schedule_service.is_scheduled(student_id, course_id),
        }), 200

    @schedule_bp.route("/students/<student_id>/schedule/<course_id>", methods=["DELETE"])
    @authorization_service.require_student
    def remove_course(student_id, course_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403
        schedule_service.remove_course(student_id, course_id)
        return jsonify({"message": "Scheduled course removed."}), 200

    return schedule_bp
