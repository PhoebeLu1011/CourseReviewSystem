from flask import Blueprint, request, jsonify
from services.user_service import UserService

def create_user_routes(user_service: UserService):
    user_bp = Blueprint('user', __name__)

    # 1. 取得個人檔案
    @user_bp.route('/profile', methods=['GET'])
    def get_profile():
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header is required."}), 401

        result = user_service.get_profile(auth_header)
        if not result["success"]:
            return jsonify(result), 401
            
        return jsonify(result)

    # 2. 💡 新增：修改個人檔案 (對應網址：PUT /api/user/你的學號)
    @user_bp.route('/<student_id>', methods=['PUT', 'OPTIONS'])
    def update_profile(student_id):
        if request.method == 'OPTIONS':
            return '', 200
            
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header is required."}), 401

        data = request.json
        # 呼叫 Service 處理更新，依序傳入 Token, 學號, 前端修改的資料
        result = user_service.update_profile(auth_header, student_id, data)
        
        if not result.get("success"):
            return jsonify(result), 400
            
        return jsonify(result), 200

    return user_bp