# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

def create_auth_routes(auth_service: AuthService):
    auth_bp = Blueprint('auth', __name__)

    @auth_bp.route('/register', methods=['POST'])
    def register():
        data = request.json
        result = auth_service.register_student(data)
        return jsonify(result)

    @auth_bp.route('/login', methods=['POST'])
    def login():
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "請輸入信箱與密碼"}), 400
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return jsonify({"success": False, "message": "請輸入信箱與密碼"}), 400
        result = auth_service.login_student(email=email, input_password=password)
        return jsonify(result)

    @auth_bp.route('/test', methods=['GET'])
    def test_route():
        return jsonify({"message": "Auth 路由連通！"})

    return auth_bp