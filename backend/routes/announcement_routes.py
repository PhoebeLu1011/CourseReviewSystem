from flask import Blueprint, jsonify


def create_announcement_routes(announcement_service):
    announcement_bp = Blueprint("announcements", __name__)

    @announcement_bp.route("/announcements", methods=["GET"])
    def get_public_announcements():
        try:
            announcements = announcement_service.get_all_announcements()
            return jsonify([a.to_dict() for a in announcements]), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    return announcement_bp
