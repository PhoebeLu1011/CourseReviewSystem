from flask import Blueprint, request, jsonify
from services.user_service import UserService

def create_user_routes(user_service: UserService):
    user_bp = Blueprint('user', __name__)

    @user_bp.route('/profile', methods=['GET'])
    def get_profile():
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"success": False, "message": "未帶通行證(Token)，拒絕訪問"}), 401

        result = user_service.get_profile(token)
        
        if not result["success"]:
            return jsonify(result), 401
            
        return jsonify(result)

    return user_bp