from flask import Blueprint, request, jsonify

def create_discussion_routes(discussion_service):
    disc_bp = Blueprint("discussions", __name__)

    @disc_bp.route("/courses/<course_id>/discussions", methods=["GET"])
    def get_course_discussions(course_id):
        data = discussion_service.get_course_discussions(course_id)
        return jsonify(data), 200
    
    @disc_bp.route("/discussions", methods=["GET"])
    def list_all_discussions():
        search_query = request.args.get("search", "")
        data = discussion_service.get_all_discussions(search_query)
        return jsonify(data), 200

    @disc_bp.route("/discussions", methods=["POST"])
    def create_discussion():
        data = request.get_json()
        result = discussion_service.create_discussion(
            author_id=data.get("authorID"),
            course_id=data.get("courseID"),
            title=data.get("title"),
            content=data.get("content")
        )
        return jsonify(result), 201
    @disc_bp.route("/discussions/<discussion_id>", methods=["GET"])
    def get_single_discussion(discussion_id):
        try:
            data = discussion_service.get_discussion_by_id(discussion_id)
            return jsonify(data), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 404

    @disc_bp.route("/discussions/<discussion_id>/replies", methods=["GET"])
    def get_replies(discussion_id):
        data = discussion_service.get_discussion_replies(discussion_id)
        return jsonify(data), 200

    @disc_bp.route("/discussions/<discussion_id>/replies", methods=["POST"])
    def post_reply(discussion_id):
        data = request.get_json()
        result = discussion_service.add_reply(
            discussion_id=discussion_id,
            author_id=data.get("authorID"),
            content=data.get("content")
        )
        return jsonify(result), 201

    @disc_bp.route("/discussions/<discussion_id>/like", methods=["POST"])
    def like_discussion(discussion_id):
        data = request.get_json()
        count = discussion_service.handle_discussion_like(discussion_id, data.get("studentID"))
        return jsonify({"likeCount": count}), 200

    @disc_bp.route("/replies/<reply_id>/like", methods=["POST"])
    def like_reply(reply_id):
        data = request.get_json()
        count = discussion_service.handle_reply_like(reply_id, data.get("studentID"))
        return jsonify({"likeCount": count}), 200
    
    @disc_bp.route("/users/<student_id>/discussions", methods=["GET"])
    def get_user_discs(student_id):
        return jsonify(discussion_service.get_user_discussions(student_id)), 200

    @disc_bp.route("/discussions/<discussion_id>", methods=["PUT"])
    def update_disc(discussion_id):
        data = request.get_json()
        return jsonify(discussion_service.update_discussion(discussion_id, data.get("studentID"), data.get("title"), data.get("content"))), 200

    @disc_bp.route("/discussions/<discussion_id>", methods=["DELETE"])
    def del_disc(discussion_id):
        data = request.get_json()
        discussion_service.delete_discussion(discussion_id, data.get("studentID"))
        return jsonify({"success": True}), 200

    @disc_bp.route("/users/<student_id>/replies", methods=["GET"])
    def get_user_reps(student_id):
        return jsonify(discussion_service.get_user_replies(student_id)), 200

    @disc_bp.route("/replies/<reply_id>", methods=["PUT"])
    def update_rep(reply_id):
        data = request.get_json()
        return jsonify(discussion_service.update_reply(reply_id, data.get("studentID"), data.get("content"))), 200

    @disc_bp.route("/replies/<reply_id>", methods=["DELETE"])
    def del_rep(reply_id):
        data = request.get_json()
        discussion_service.delete_reply(reply_id, data.get("studentID"))
        return jsonify({"success": True}), 200

    return disc_bp