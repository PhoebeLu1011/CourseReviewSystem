from flask import Blueprint, request, jsonify
import traceback

def create_group_routes(group_recommendation_service, group_service):
    group_bp = Blueprint("groups", __name__)

    def group_to_response(group, recommendation_score=None):
        group_data = group.to_dict()
        group_data["recommendation_score"] = recommendation_score
        return group_data

    def groups_to_response(groups, student_id=None):
        result = []

        for group in groups:
            recommendation_score = None

            if student_id:
                recommendation_score = (
                    group_recommendation_service.calculate_match_score(
                        student_id=student_id,
                        group=group,
                    )
                )

            result.append(
                group_to_response(
                    group=group,
                    recommendation_score=recommendation_score,
                )
            )

        return result

    @group_bp.route("/groups", methods=["POST"])
    def create_group():
        try:
            data = request.get_json() or {}

            group = group_service.create_group(
                group_name=data.get("group_name"),
                course_id=data.get("course_id"),
                leader_id=data.get("leader_id"),
                max_members=data.get("max_members"),
                needed_members=data.get("needed_members"),
                recruitment_deadline=data.get("recruitment_deadline"),
                description=data.get("description"),
                tags=data.get("tags", []),
            )

            return jsonify(group.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Recommend all groups error:", e)
            traceback.print_exc()
            return jsonify({"message": str(e)}), 500
    @group_bp.route("/groups/recommended", methods=["GET"])
    def recommend_all_groups():
        try:
            student_id = request.args.get("student_id")

            if student_id:
                groups = group_recommendation_service.recommend_groups(
                    student_id=student_id,
                    course_id=None,
                )
            else:
                groups = group_recommendation_service.list_joinable_groups(
                    course_id=None,
                )

            return jsonify(groups_to_response(groups, student_id)), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Recommend groups by course error:", e)
            traceback.print_exc()
            return jsonify({"message": str(e)}), 500
    @group_bp.route("/courses/<course_id>/groups/recommended", methods=["GET"])
    def recommend_groups_by_course(course_id):
        try:
            student_id = request.args.get("student_id")

            if student_id:
                groups = group_recommendation_service.recommend_groups(
                    student_id=student_id,
                    course_id=course_id,
                )
            else:
                groups = group_recommendation_service.list_joinable_groups(
                    course_id=course_id,
                )

            return jsonify(groups_to_response(groups, student_id)), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Recommend groups by course error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/close", methods=["POST"])
    def close_group(group_id):
        try:
            data = request.get_json() or {}
            leader_id = data.get("leader_id")

            if not leader_id:
                return jsonify({"message": "leader_id is required."}), 400

            group = group_service.get_group(group_id)

            if group.leader_id != leader_id:
                return jsonify({
                    "message": "Only the group leader can close recruitment."
                }), 403

            group_service.close_recruitment(group_id)
            updated_group = group_service.get_group(group_id)

            return jsonify(updated_group.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Close group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/reopen", methods=["POST"])
    def reopen_group(group_id):
        try:
            data = request.get_json() or {}
            leader_id = data.get("leader_id")

            if not leader_id:
                return jsonify({"message": "leader_id is required."}), 400

            group = group_service.get_group(group_id)

            if group.leader_id != leader_id:
                return jsonify({
                    "message": "Only the group leader can reopen recruitment."
                }), 403

            group_service.reopen_recruitment(group_id)
            updated_group = group_service.get_group(group_id)

            return jsonify(updated_group.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Reopen group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    return group_bp