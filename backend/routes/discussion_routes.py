"""
GET  /courses/<course_id>/discussions
POST /discussions
POST /discussions/<discussion_id>/like

GET  /discussions/<discussion_id>/replies
POST /replies
POST /replies/<reply_id>/like
"""
from flask import Blueprint, request, jsonify

def create_discussion_routes(discussion_service):
    discussion_bp = Blueprint("discussions", __name__)

    
    # DISCUSSION THREAD ROUTES
    

    @discussion_bp.route("/courses/<course_id>/discussions", methods=["GET"])
    def list_course_discussions(course_id):
        # Extract query parameters for sorting and pagination, with defaults
        sort_by = request.args.get("sort_by", "newest")
        limit = int(request.args.get("limit", 10))
        skip = int(request.args.get("skip", 0))

        discussions = discussion_service.get_discussions_by_course(course_id, sort_by, limit, skip)
        
        return jsonify([d.to_dict() for d in discussions]), 200


    @discussion_bp.route("/discussions", methods=["POST"])
    def create_discussion():
        try:
            data = request.get_json()
            
            new_discussion_dict = discussion_service.create_discussion(
                course_id=data.get("course_id"),
                student_id=data.get("student_id"),
                title=data.get("title"),
                content=data.get("content")
            )

            return jsonify(new_discussion_dict), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400


    @discussion_bp.route("/discussions/<discussion_id>/like", methods=["POST"])
    def toggle_discussion_like(discussion_id):
        try:
            data = request.get_json()
            student_id = data.get("student_id")

            # Call the service and get the updated like count
            new_like_count = discussion_service.handle_discussion_like(
                discussion_id=discussion_id, 
                student_id=student_id
            )

            return jsonify({"likeCount": new_like_count}), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400


   
    # REPLY ROUTES
    

    @discussion_bp.route("/discussions/<discussion_id>/replies", methods=["GET"])
    def list_discussion_replies(discussion_id):
        sort_by = request.args.get("sort_by", "newest")
        limit = int(request.args.get("limit", 20))
        skip = int(request.args.get("skip", 0))

        replies = discussion_service.get_replies_for_discussion(discussion_id, sort_by, limit, skip)
        
        return jsonify([r.to_dict() for r in replies]), 200


    @discussion_bp.route("/replies", methods=["POST"])
    def create_reply():
        try:
            data = request.get_json()
            
            new_reply_dict = discussion_service.create_reply(
                discussion_id=data.get("discussion_id"),
                student_id=data.get("student_id"),
                content=data.get("content")
            )

            return jsonify(new_reply_dict), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400


    @discussion_bp.route("/replies/<reply_id>/like", methods=["POST"])
    def toggle_reply_like(reply_id):
        try:
            data = request.get_json()
            student_id = data.get("student_id")

            new_like_count = discussion_service.handle_reply_like(
                reply_id=reply_id, 
                student_id=student_id
            )

            return jsonify({"likeCount": new_like_count}), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    return discussion_bp