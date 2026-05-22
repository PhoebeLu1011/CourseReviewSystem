"""
GET    /students/<student_id>/bookmarks               - 取得收藏清單
GET    /students/<student_id>/bookmarks/<course_id>   - 確認是否已收藏
POST   /students/<student_id>/bookmarks               - 新增收藏
DELETE /students/<student_id>/bookmarks/<course_id>   - 移除收藏
GET    /courses/<course_id>/bookmarks/count           - 取得課程被收藏次數
"""
from flask import Blueprint, request, jsonify


def create_bookmark_routes(favorite_service):
    bookmark_bp = Blueprint("bookmarks", __name__)

    @bookmark_bp.route("/students/<student_id>/bookmarks", methods=["GET"])
    def get_bookmarks(student_id):
        bookmarks = favorite_service.get_bookmarks_by_user(student_id)
        return jsonify([b.to_dict() for b in bookmarks]), 200

    @bookmark_bp.route("/students/<student_id>/bookmarks/<course_id>", methods=["GET"])
    def check_bookmark(student_id, course_id):
        is_bookmarked = favorite_service.is_bookmarked(student_id, course_id)
        return jsonify({"isBookmarked": is_bookmarked}), 200

    @bookmark_bp.route("/students/<student_id>/bookmarks", methods=["POST"])
    def add_bookmark(student_id):
        try:
            data = request.get_json()
            course_id = data.get("courseId")

            if not course_id:
                return jsonify({"message": "courseId is required."}), 400

            bookmark = favorite_service.add_bookmark(student_id, course_id)

            if not bookmark:
                return jsonify({"message": "Already bookmarked."}), 409

            return jsonify(bookmark.to_dict()), 201

        except ValueError as e:
            return jsonify({"message": str(e)}), 400

    @bookmark_bp.route("/students/<student_id>/bookmarks/<course_id>", methods=["DELETE"])
    def remove_bookmark(student_id, course_id):
        favorite_service.remove_bookmark(student_id, course_id)
        return jsonify({"message": "Bookmark removed."}), 200

    @bookmark_bp.route("/courses/<course_id>/bookmarks/count", methods=["GET"])
    def count_bookmarks(course_id):
        count = favorite_service.count_bookmarks_for_course(course_id)
        return jsonify({"count": count}), 200

    return bookmark_bp
