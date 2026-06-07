"""
GET    /students/<student_id>/bookmarks               - 取得收藏清單
GET    /students/<student_id>/bookmarks/<course_id>   - 確認是否已收藏
POST   /students/<student_id>/bookmarks               - 新增收藏
DELETE /students/<student_id>/bookmarks/<course_id>   - 移除收藏
GET    /courses/<course_id>/bookmarks/count           - 取得課程被收藏次數
"""
from flask import Blueprint, request, jsonify


def create_bookmark_routes(favorite_service, authorization_service):
    bookmark_bp = Blueprint("bookmarks", __name__)

    @bookmark_bp.errorhandler(ValueError)
    def handle_value_error(error):
        message = str(error)
        if "already bookmarked" in message:
            return jsonify({"message": message}), 409
        status = 404 if "not found" in message.lower() else 400
        return jsonify({"message": message}), status

    @bookmark_bp.route("/students/<student_id>/bookmarks", methods=["GET"])
    @authorization_service.require_student
    def get_bookmarks(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        bookmarks = favorite_service.get_bookmarks_by_user(student_id)
        return jsonify([b.to_dict() for b in bookmarks]), 200

    @bookmark_bp.route("/students/<student_id>/bookmarks/<course_id>", methods=["GET"])
    @authorization_service.require_student
    def check_bookmark(student_id, course_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        is_bookmarked = favorite_service.is_bookmarked(student_id, course_id)
        return jsonify({"isBookmarked": is_bookmarked}), 200

    @bookmark_bp.route("/students/<student_id>/bookmarks", methods=["POST"])
    @authorization_service.require_student
    def add_bookmark(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        data = request.get_json() or {}
        bookmark = favorite_service.add_bookmark(student_id, data.get("courseId"))
        return jsonify(bookmark.to_dict()), 201

    @bookmark_bp.route("/students/<student_id>/bookmarks/<course_id>", methods=["DELETE"])
    @authorization_service.require_student
    def remove_bookmark(student_id, course_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"message": "Permission denied."}), 403

        favorite_service.remove_bookmark(student_id, course_id)
        return jsonify({"message": "Bookmark removed."}), 200

    @bookmark_bp.route("/courses/<course_id>/bookmarks/count", methods=["GET"])
    def count_bookmarks(course_id):
        count = favorite_service.count_bookmarks_for_course(course_id)
        return jsonify({"count": count}), 200

    return bookmark_bp
