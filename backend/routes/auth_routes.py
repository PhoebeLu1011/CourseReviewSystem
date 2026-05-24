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
        email = data.get("email")
        result = auth_service.login_student(email)
        return jsonify(result)

    @auth_bp.route('/test', methods=['GET'])
    def test_route():
        return jsonify({"message": "恭喜你！Auth 路由完美連通了！"})

    return auth_bp