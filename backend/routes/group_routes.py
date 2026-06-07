from flask import Blueprint, request, jsonify
import traceback

def create_group_routes(
    group_recommendation_service,
    group_service,
    group_dashboard_service,
    authorization_service,
):
    group_bp = Blueprint("groups", __name__)

    @group_bp.route("/groups", methods=["POST"])
    @authorization_service.require_student
    def create_group():
        try:
            data = request.get_json() or {}

            group = group_service.create_group(
                group_name=data.get("group_name"),
                course_id=data.get("course_id"),
                leader_id=authorization_service.current_student_id(),
                needed_members=data.get("needed_members"),
                recruitment_deadline=data.get("recruitment_deadline"),
                description=data.get("description"),
                tags=data.get("tags", []),
            )

            return jsonify(group.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Create group error:", e)
            traceback.print_exc()
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/me/dashboard", methods=["GET"])
    @authorization_service.require_student
    def get_my_group_dashboard():
        dashboard = group_dashboard_service.get_dashboard(
            authorization_service.current_student_id()
        )
        return jsonify(dashboard), 200

    @group_bp.route("/groups/recommended", methods=["GET"])
    def recommend_all_groups():
        try:
            student_id = request.args.get("student_id")

            if student_id:
                recommendations = group_recommendation_service.recommend_group_results(
                    student_id=student_id,
                    course_id=None,
                )
                return jsonify([
                    recommendation.to_dict()
                    for recommendation in recommendations
                ]), 200
            else:
                groups = group_recommendation_service.list_joinable_groups(
                    course_id=None,
                )

            return jsonify([group.to_dict() for group in groups]), 200

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
                recommendations = group_recommendation_service.recommend_group_results(
                    student_id=student_id,
                    course_id=course_id,
                )
                return jsonify([
                    recommendation.to_dict()
                    for recommendation in recommendations
                ]), 200
            else:
                groups = group_recommendation_service.list_joinable_groups(
                    course_id=course_id,
                )

            return jsonify([group.to_dict() for group in groups]), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

        except Exception as e:
            print("Recommend groups by course error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/close", methods=["POST"])
    @authorization_service.require_student
    def close_group(group_id):
        try:
            leader_id = authorization_service.current_student_id()

            group = group_service.close_recruitment(group_id, leader_id)
            return jsonify(group.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

        except Exception as e:
            print("Close group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/reopen", methods=["POST"])
    @authorization_service.require_student
    def reopen_group(group_id):
        try:
            leader_id = authorization_service.current_student_id()

            group = group_service.reopen_recruitment(group_id, leader_id)
            return jsonify(group.to_dict()), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

        except Exception as e:
            print("Reopen group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/members/<student_id>", methods=["DELETE"])
    @authorization_service.require_student
    def remove_group_member(group_id, student_id):
        try:
            group = group_service.remove_member(
                group_id=group_id,
                student_id=student_id,
                leader_id=authorization_service.current_student_id(),
            )
            return jsonify(group.to_dict()), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403
        except Exception as e:
            print("Remove group member error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/members/me", methods=["DELETE"])
    @authorization_service.require_student
    def leave_group(group_id):
        try:
            group = group_service.leave_group(
                group_id=group_id,
                student_id=authorization_service.current_student_id(),
            )
            return jsonify(group.to_dict()), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except Exception as e:
            print("Leave group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>", methods=["PATCH"])
    @authorization_service.require_student
    def edit_group(group_id):
        try:
            data = request.get_json() or {}
            editable_fields = {
                key: data[key]
                for key in (
                    "group_name",
                    "needed_members",
                    "recruitment_deadline",
                    "description",
                    "tags",
                )
                if key in data
            }
            group = group_service.edit_group(
                group_id=group_id,
                leader_id=authorization_service.current_student_id(),
                **editable_fields,
            )
            return jsonify(group.to_dict()), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403
        except Exception as e:
            print("Edit group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>/transfer-leadership", methods=["POST"])
    @authorization_service.require_student
    def transfer_group_leadership(group_id):
        try:
            data = request.get_json() or {}
            group = group_service.transfer_leadership(
                group_id=group_id,
                leader_id=authorization_service.current_student_id(),
                new_leader_id=data.get("new_leader_id"),
            )
            return jsonify(group.to_dict()), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403
        except Exception as e:
            print("Transfer group leadership error:", e)
            return jsonify({"message": "Internal server error."}), 500

    @group_bp.route("/groups/<group_id>", methods=["DELETE"])
    @authorization_service.require_student
    def dissolve_group(group_id):
        try:
            group = group_service.dissolve_group(
                group_id=group_id,
                leader_id=authorization_service.current_student_id(),
            )
            return jsonify(group.to_dict()), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403
        except Exception as e:
            print("Dissolve group error:", e)
            return jsonify({"message": "Internal server error."}), 500

    return group_bp
