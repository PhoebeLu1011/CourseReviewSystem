"""
GET  /courses/<course_id>/reviews
POST /reviews
POST /reviews/<review_id>/like
"""
from flask import Blueprint, request, jsonify

def create_review_routes(review_service):
    review_bp = Blueprint("reviews", __name__)

    @review_bp.route("/courses/<course_id>/reviews", methods=["GET"])
    def list_course_reviews(course_id):
        # Extract query parameters for sorting and pagination, with defaults
        sort_by = request.args.get("sort_by", "newest")
        limit = int(request.args.get("limit", 10))
        skip = int(request.args.get("skip", 0))

        reviews = review_service.get_reviews_by_course(course_id, sort_by, limit, skip)
        
        return jsonify([r.to_dict() for r in reviews]), 200
    
    @review_bp.route("/reviews", methods=["GET"])
    def list_all_reviews():
        # Global feed for all reviews (now with search!)
        search_query = request.args.get("search", "") # Grab search term
        sort_by = request.args.get("sort_by", "newest")
        limit = int(request.args.get("limit", 20))
        skip = int(request.args.get("skip", 0))

        reviews = review_service.get_all_reviews(search_query, sort_by, limit, skip)
        return jsonify([r.to_dict() for r in reviews]), 200


    @review_bp.route("/reviews", methods=["POST"])
    def create_review():
        try:
            data = request.get_json()
            
            # The service returns the dictionary format directly based on your previous code
            new_review_dict = review_service.create_review(
                student_id=data.get("authorID"),
                course_id=data.get("courseID"),
                content=data.get("content"),
                sweetness=data.get("sweetnessScore"),
                workload=data.get("workloadScore")
            )

            return jsonify(new_review_dict), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400


    @review_bp.route("/reviews/<review_id>/like", methods=["POST"])
    def toggle_like(review_id):
        try:
            data = request.get_json()
            student_id = data.get("student_id")

            # Call the service and get the updated like count
            new_like_count = review_service.handle_like(
                review_id=review_id, 
                student_id=student_id
            )

            return jsonify({"likeCount": new_like_count}), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        
    
    @review_bp.route("/users/<student_id>/reviews", methods=["GET"])
    def get_user_reviews(student_id):
        reviews = review_service.get_reviews_by_student(student_id)
        return jsonify([r.to_dict() for r in reviews]), 200

    @review_bp.route("/reviews/<review_id>", methods=["PUT"])
    def edit_review(review_id):
        try:
            data = request.get_json()
            updated_review = review_service.update_review(
                review_id=review_id,
                student_id=data.get("authorID"),
                content=data.get("content"),
                sweetness=data.get("sweetnessScore"),
                workload=data.get("workloadScore")
            )
            return jsonify(updated_review), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @review_bp.route("/reviews/<review_id>", methods=["DELETE"])
    def delete_review(review_id):
        try:
            data = request.get_json()
            student_id = data.get("authorID")
            review_service.delete_review(review_id, student_id)
            return jsonify({"success": True, "message": "Review deleted."}), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    return review_bp