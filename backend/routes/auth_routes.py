from flask import Blueprint, request, jsonify
from services.auth_service import AuthService


def create_auth_routes(auth_service: AuthService):
    auth_bp = Blueprint("auth", __name__)
    @auth_bp.route("/register", methods=["POST", "OPTIONS"])
    def register():
        # Handle browser CORS preflight request
        if request.method == "OPTIONS":
            return jsonify({"success": True}), 200

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required."
            }), 400

        result = auth_service.register_student(data)

        if result["success"]:
            return jsonify(result), 201

        return jsonify(result), 400

    @auth_bp.route("/login", methods=["POST", "OPTIONS"])
    def login():
        # Handle browser CORS preflight request
        if request.method == "OPTIONS":
            return jsonify({"success": True}), 200

        try:
            data = request.get_json(silent=True)

            if not data:
                return jsonify({
                    "success": False,
                    "message": "Login data is required."
                }), 400

            email = data.get("email")
            password = data.get("password")
            role = data.get("role", "Student")

            if role == "Admin":
                result = auth_service.login_admin(
                    account=email,
                    input_password=password
                )
            else:
                result = auth_service.login_student(
                    email=email,
                    input_password=password
                )

            if result["success"]:
                return jsonify(result), 200

            return jsonify(result), 401

        except Exception as e:
            import traceback
            traceback.print_exc()

            return jsonify({
                "success": False,
                "message": "Login failed.",
                "error": str(e)
            }), 500

    @auth_bp.route("/test", methods=["GET"])
    def test_route():
        return jsonify({
            "message": "Auth route is working."
        }), 200

    return auth_bp