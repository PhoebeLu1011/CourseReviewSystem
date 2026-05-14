from flask import Blueprint, request, jsonify

def create_group_routes(group_recommendation_service):
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

            result = []
            for group in groups:
                group_data = group.to_dict()
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