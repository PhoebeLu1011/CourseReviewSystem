# backend/routes/user_routes.py
from flask import Blueprint, jsonify
from services.user_service import UserService

def create_user_routes(user_service: UserService):
    user_bp = Blueprint('user', __name__)

    # 👈 原本在 auth 裡面的 profile 搬來這裡了！
    @user_bp.route('/profile/<student_id>', methods=['GET'])
    def get_profile(student_id):
        result = user_service.get_profile(student_id)
        return jsonify(result)

    return user_bp
