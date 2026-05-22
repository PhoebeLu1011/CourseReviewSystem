from flask import Blueprint, jsonify

def create_achievement_routes(achievement_service, student_repo):
    achievement_bp = Blueprint("achievement", __name__, url_prefix="/achievements")

    @achievement_bp.route("/students/<student_id>/badges", methods=["GET"])
    def get_student_badges(student_id):
        student = student_repo.find_by_id(student_id)

        if not student:
            return jsonify({"error": "Student not found."}), 404

        badges = achievement_service.get_current_badges(student)

        return jsonify({
            "studentID": student.studentID,
            "badges": [badge.to_dict() for badge in badges]
        }), 200

    @achievement_bp.route("/students/<student_id>/score", methods=["GET"])
    def get_student_achievement_score(student_id):
        student = student_repo.find_by_id(student_id)

        if not student:
            return jsonify({"error": "Student not found."}), 404

        score = achievement_service.calculate_achievement_score(student)

        return jsonify({
            "studentID": student.studentID,
            "achievementScore": score,
            "reviewCount": student.reviewCount,
            "replyCount": student.replyCount,
            "applyCount": student.applyCount
        }), 200

    @achievement_bp.route("/students/<student_id>/badges/check", methods=["POST"])
    def check_student_badges(student_id):
        student = student_repo.find_by_id(student_id)

        if not student:
            return jsonify({"error": "Student not found."}), 404

        new_badges = achievement_service.update_student_badges(student)
        student_repo.save(student)

        return jsonify({
            "studentID": student.studentID,
            "newBadges": [badge.to_dict() for badge in new_badges],
            "currentBadges": student.badges
        }), 200

    return achievement_bp