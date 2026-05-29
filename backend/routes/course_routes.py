"""
GET /courses/search        — search (q, department, level, semester, academicYear, limit, skip)
GET /courses/departments   — list all departments
GET /courses/years         — list all academic years
GET /courses/<course_id>   — get a single course
"""
from flask import Blueprint, request, jsonify


def create_course_routes(course_service):
    course_bp = Blueprint("courses", __name__)

    # ── Static paths first ───────────────────────────────────────────────────

    @course_bp.route("/courses/search", methods=["GET"])
    def search_courses():
        search_query = request.args.get("q", "")
        limit        = int(request.args.get("limit", 20))
        skip         = int(request.args.get("skip", 0))
        department   = request.args.get("department")   or None
        level        = request.args.get("level")        or None
        semester     = request.args.get("semester")     or None
        academic_year = request.args.get("academicYear") or None

        results = course_service.search_courses(
            search_query, limit, skip,
            department=department, level=level,
            semester=semester, academicYear=academic_year,
        )
        total = course_service.count_courses(
            search_query,
            department=department, level=level,
            semester=semester, academicYear=academic_year,
        )
        return jsonify({"courses": results, "total": total}), 200

    @course_bp.route("/courses/departments", methods=["GET"])
    def get_departments():
        return jsonify(course_service.get_departments()), 200

    @course_bp.route("/courses/years", methods=["GET"])
    def get_years():
        return jsonify(course_service.get_academic_years()), 200

    # ── Dynamic path last ────────────────────────────────────────────────────

    @course_bp.route("/courses/<course_id>", methods=["GET"])
    def get_course_details(course_id):
        try:
            return jsonify(course_service.get_course(course_id)), 200
        except ValueError as e:
            return jsonify({"message": str(e)}), 404

    return course_bp
