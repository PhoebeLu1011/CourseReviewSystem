"""
GET /courses/<course_id>
GET /courses/search
"""
from flask import Blueprint, request, jsonify

def create_course_routes(course_service):
    course_bp = Blueprint("courses", __name__)

    @course_bp.route("/courses/<course_id>", methods=["GET"])
    def get_course_details(course_id):
        try:
            course_data = course_service.get_course(course_id)
            return jsonify(course_data), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 404

    @course_bp.route("/courses/search", methods=["GET"])
    def search_courses():
        # Grab the user's search text from the URL (?q=machine)
        search_query = request.args.get("q", "")
        limit = int(request.args.get("limit", 20))
        skip = int(request.args.get("skip", 0))

        results = course_service.search_courses(search_query, limit, skip)
        return jsonify(results), 200

    return course_bp