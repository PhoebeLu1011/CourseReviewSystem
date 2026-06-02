from flask import Blueprint, request, jsonify

def _course_summary(course_data):
    if not course_data:
        return None

    return {
        "courseID": course_data.get("courseID"),
        "title": course_data.get("title"),
        "department": course_data.get("department"),
        "professors": course_data.get("professors"),
        "academicYear": course_data.get("academicYear"),
        "semester": course_data.get("semester"),
    }


def create_group_routes(group_recommendation_service, course_service=None):
    group_bp = Blueprint("groups", __name__)

    @group_bp.route("/courses/<course_id>/groups/recommended", methods=["GET"])
    def recommend_groups(course_id):
        try:
            student_id = request.args.get("student_id")

            if not student_id:
                return jsonify({"message": "student_id is required."}), 400

            groups = group_recommendation_service.recommend_groups(
                student_id=student_id,
                course_id=course_id,
            )

            course_summary = None
            if course_service:
                try:
                    course_summary = _course_summary(
                        course_service.get_course(course_id)
                    )
                except ValueError:
                    course_summary = None

            result = []
            for group in groups:
                group_data = group.to_dict()
                group_data["course"] = course_summary
                group_data["recommendation_score"] = (
                    group_recommendation_service.calculate_match_score(
                        student_id=student_id,
                        group=group,
                    )
                )
                result.append(group_data)

            return jsonify(result), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    return group_bp
