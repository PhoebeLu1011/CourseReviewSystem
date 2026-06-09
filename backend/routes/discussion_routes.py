from flask import Blueprint, request, jsonify

def create_discussion_routes(discussion_service, authorization_service):
    disc_bp = Blueprint("discussions", __name__)

    @disc_bp.errorhandler(PermissionError)
    def handle_permission_error(error):
        return jsonify({"message": str(error)}), 403

    @disc_bp.errorhandler(ValueError)
    def handle_value_error(error):
        status = 404 if "not found" in str(error).lower() else 400
        return jsonify({"message": str(error)}), status

    @disc_bp.route("/courses/<course_id>/discussions", methods=["GET"])
    def get_course_discussions(course_id):
        sort_by = request.args.get("sort_by", "newest")
        data = discussion_service.get_course_discussions(course_id, sort_by)
        return jsonify(data), 200
    
    @disc_bp.route("/discussions", methods=["GET"])
    def list_all_discussions():
        search_query = request.args.get("search", "")
        sort_by = request.args.get("sort_by", "newest")
        data = discussion_service.get_all_discussions(search_query, sort_by)
        return jsonify(data), 200

    @disc_bp.route("/discussions", methods=["POST"])
    @authorization_service.require_student
    def create_discussion():
        data = request.get_json() or {}
        result = discussion_service.create_discussion(
            author_id=authorization_service.current_student_id(),
            course_id=data.get("courseID"),
            title=data.get("title"),
            content=data.get("content")
        )
        return jsonify(result), 201

    @disc_bp.route("/discussions/<discussion_id>", methods=["GET"])
    def get_single_discussion(discussion_id):
        data = discussion_service.get_discussion_by_id(discussion_id)
        return jsonify(data), 200

    @disc_bp.route("/discussions/<discussion_id>/replies", methods=["GET"])
    def get_replies(discussion_id):
        data = discussion_service.get_discussion_replies(discussion_id)
        return jsonify(data), 200

    @disc_bp.route("/discussions/<discussion_id>/replies", methods=["POST"])
    @authorization_service.require_student
    def post_reply(discussion_id):
        data = request.get_json() or {}
        result = discussion_service.add_reply(
            discussion_id=discussion_id,
            author_id=authorization_service.current_student_id(),
            content=data.get("content")
        )
        return jsonify(result), 201

    @disc_bp.route("/discussions/<discussion_id>/like", methods=["POST"])
    @authorization_service.require_student
    def like_discussion(discussion_id):
        count = discussion_service.handle_discussion_like(
            discussion_id,
            authorization_service.current_student_id(),
        )
        return jsonify({"likeCount": count}), 200

    @disc_bp.route("/replies/<reply_id>/like", methods=["POST"])
    @authorization_service.require_student
    def like_reply(reply_id):
        count = discussion_service.handle_reply_like(
            reply_id,
            authorization_service.current_student_id(),
        )
        return jsonify({"likeCount": count}), 200
    
    @disc_bp.route("/users/<student_id>/discussions", methods=["GET"])
    def get_user_discs(student_id):
        return jsonify(discussion_service.get_user_discussions(student_id)), 200

    @disc_bp.route("/discussions/<discussion_id>", methods=["PUT"])
    @authorization_service.require_student
    def update_disc(discussion_id):
        data = request.get_json() or {}
        return jsonify(discussion_service.update_discussion(
            discussion_id,
            authorization_service.current_student_id(),
            data.get("title"),
            data.get("content"),
        )), 200

    @disc_bp.route("/discussions/<discussion_id>", methods=["DELETE"])
    @authorization_service.require_student
    def del_disc(discussion_id):
        discussion_service.delete_discussion(
            discussion_id,
            authorization_service.current_student_id(),
        )
        return jsonify({"success": True}), 200

    @disc_bp.route("/users/<student_id>/replies", methods=["GET"])
    def get_user_reps(student_id):
        return jsonify(discussion_service.get_user_replies(student_id)), 200

    @disc_bp.route("/replies/<reply_id>", methods=["PUT"])
    @authorization_service.require_student
    def update_rep(reply_id):
        data = request.get_json() or {}
        return jsonify(discussion_service.update_reply(
            reply_id,
            authorization_service.current_student_id(),
            data.get("content"),
        )), 200

    @disc_bp.route("/replies/<reply_id>", methods=["DELETE"])
    @authorization_service.require_student
    def del_rep(reply_id):
        discussion_service.delete_reply(
            reply_id,
            authorization_service.current_student_id(),
        )
        return jsonify({"success": True}), 200

    return disc_bp