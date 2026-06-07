"""
GET  /courses/<course_id>/reviews
POST /reviews
POST /reviews/<review_id>/like
"""
from flask import Blueprint, request, jsonify

def create_review_routes(review_service, authorization_service):
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
        # Grab query parameters matching the React frontend URLSearchParams
        search_query = request.args.get("q", "") 
        sort_by = request.args.get("sort_by", "newest")
        department = request.args.get("department", "")
        limit = int(request.args.get("limit", 20))
        skip = int(request.args.get("skip", 0))

        # Pass the new department filter into your service!
        reviews = review_service.get_all_reviews(search_query, sort_by, department, limit, skip)
        
        # Safely return whether your service returned dicts or models
        return jsonify([r.to_dict() if hasattr(r, 'to_dict') else r for r in reviews]), 200

    @review_bp.route("/reviews", methods=["POST"])
    @authorization_service.require_student
    def create_review():
        try:
            data = request.get_json() or {}
            
            # The service returns the dictionary format directly based on your previous code
            new_review_dict = review_service.create_review(
                student_id=authorization_service.current_student_id(),
                course_id=data.get("courseID"),
                content=data.get("content"),
                sweetness=data.get("sweetnessScore"),
                workload=data.get("workloadScore")
            )

            return jsonify(new_review_dict), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403


    @review_bp.route("/reviews/<review_id>/like", methods=["POST"])
    @authorization_service.require_student
    def toggle_like(review_id):
        try:
            # Call the service and get the updated like count
            new_like_count = review_service.handle_like(
                review_id=review_id,
                student_id=authorization_service.current_student_id()
            )

            return jsonify({"likeCount": new_like_count}), 200

        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403
        
    
    @review_bp.route("/users/<student_id>/reviews", methods=["GET"])
    def get_user_reviews(student_id):
        reviews = review_service.get_reviews_by_student(student_id)
        return jsonify([r.to_dict() for r in reviews]), 200

    @review_bp.route("/reviews/<review_id>", methods=["PUT"])
    @authorization_service.require_student
    def edit_review(review_id):
        try:
            data = request.get_json() or {}
            updated_review = review_service.update_review(
                review_id=review_id,
                student_id=authorization_service.current_student_id(),
                content=data.get("content"),
                sweetness=data.get("sweetnessScore"),
                workload=data.get("workloadScore")
            )
            return jsonify(updated_review), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    @review_bp.route("/reviews/<review_id>", methods=["DELETE"])
    @authorization_service.require_student
    def delete_review(review_id):
        try:
            review_service.delete_review(
                review_id,
                authorization_service.current_student_id(),
            )
            return jsonify({"success": True, "message": "Review deleted."}), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 400
        except PermissionError as e:
            return jsonify({"message": str(e)}), 403

    return review_bp
