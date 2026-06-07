from flask import Blueprint, jsonify

def create_achievement_routes(achievement_service, _student_repo, authorization_service):
    achievement_bp = Blueprint("achievement", __name__, url_prefix="/achievements")

    @achievement_bp.errorhandler(ValueError)
    def handle_value_error(error):
        status = 404 if "not found" in str(error).lower() else 400
        return jsonify({"message": str(error)}), status

    @achievement_bp.route("/students/<student_id>/badges", methods=["GET"])
    def get_student_badges(student_id):
        student, badges = achievement_service.get_student_badges(student_id)

        return jsonify({
            "studentID": student.studentID,
            "badges": [badge.to_dict() for badge in badges]
        }), 200

    @achievement_bp.route("/students/<student_id>/score", methods=["GET"])
    def get_student_achievement_score(student_id):
        student, score = achievement_service.get_student_score(student_id)

        return jsonify({
            "studentID": student.studentID,
            "achievementScore": score,
            "reviewCount": student.reviewCount,
            "replyCount": student.replyCount,
            "applyCount": student.applyCount
        }), 200

    @achievement_bp.route("/students/<student_id>/badges/check", methods=["POST"])
    @authorization_service.require_student
    def check_student_badges(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        student, new_badges = achievement_service.award_eligible_badges(student_id)

        return jsonify({
            "studentID": student.studentID,
            "newBadges": [badge.to_dict() for badge in new_badges],
            "currentBadges": student.badges
        }), 200

    return achievement_bp
