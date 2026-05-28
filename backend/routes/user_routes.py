from flask import Blueprint, request, jsonify
from services.user_service import UserService

def create_user_routes(user_service: UserService):
    user_bp = Blueprint('user', __name__)

    @user_bp.route('/profile', methods=['GET'])
    def get_profile():
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            return jsonify({"success": False, "message": "Authorization header is required."}), 401

        result = user_service.get_profile(auth_header)
        
        if not result["success"]:
            return jsonify(result), 401
            
        return jsonify(result)

    return user_bp