from flask import Blueprint, jsonify, request

from services.auth.auth_service import AuthenticationError, RegistrationConflictError


def create_auth_routes(auth_service):
    auth_bp = Blueprint("auth", __name__)

    @auth_bp.errorhandler(AuthenticationError)
    def handle_authentication_error(error):
        return jsonify({"success": False, "message": str(error)}), 401

    @auth_bp.errorhandler(RegistrationConflictError)
    def handle_registration_conflict(error):
        return jsonify({"success": False, "message": str(error)}), 409

    @auth_bp.errorhandler(ValueError)
    def handle_value_error(error):
        return jsonify({"success": False, "message": str(error)}), 400

    @auth_bp.route("/register", methods=["POST"])
    def register():
        result = auth_service.register_student(request.get_json(silent=True))
        return jsonify(result.to_dict()), 201

    @auth_bp.route("/login", methods=["POST"])
    def login():
        data = request.get_json(silent=True) or {}
        result = auth_service.login(
            role=data.get("role", "student"),
            credential=data.get("email"),
            password=data.get("password"),
        )
        return jsonify(result.to_dict()), 200

    @auth_bp.route("/test", methods=["GET"])
    def test_route():
        return jsonify({"message": "Auth route is working."}), 200

    return auth_bp
