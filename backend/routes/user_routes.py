import io

from flask import Blueprint, request, jsonify, send_file
from services.profile.user_service import UserService
from departments import DEPARTMENTS_DATA

def create_user_routes(user_service: UserService, authorization_service):
    user_bp = Blueprint('user', __name__)

    @user_bp.errorhandler(ValueError)
    def handle_value_error(error):
        status = 404 if "not found" in str(error).lower() else 400
        return jsonify({"success": False, "message": str(error)}), status

    @user_bp.route('/departments', methods=['GET'])
    def get_departments():
        return jsonify({
            "success": True,
            "data": DEPARTMENTS_DATA
        }), 200

    # 取得個人檔案
    @user_bp.route('/profile', methods=['GET'])
    @authorization_service.require_student
    def get_profile():
        student = user_service.get_profile(authorization_service.current_student_id())
        return jsonify({
            "success": True,
            "message": "Profile retrieved successfully.",
            "student": student,
        }), 200
    # 上傳頭像 API
    @user_bp.route('/avatar', methods=['POST'])
    @authorization_service.require_student
    def upload_avatar():
        if 'avatar' not in request.files:
            return jsonify({"success": False, "message": "Missing avatar file."}), 400

        file = request.files['avatar']
        avatar_id = user_service.upload_avatar(
            authorization_service.current_student_id(),
            file,
        )
        return jsonify({
            "success": True,
            "message": "Avatar uploaded successfully.",
            "avatar_id": avatar_id,
        }), 200
    
    # 讀取頭像 API
    @user_bp.route('/avatar/<file_id>', methods=['GET'])
    def get_avatar(file_id):
        avatar = user_service.get_avatar(file_id)
        return send_file(io.BytesIO(avatar.content), mimetype=avatar.content_type)

    # 2. 修改個人檔案 
    @user_bp.route('/<student_id>', methods=['PUT'])
    @authorization_service.require_student
    def update_profile(student_id):
        if student_id != authorization_service.current_student_id():
            return jsonify({"success": False, "message": "Permission denied."}), 403

        data = request.json or {}
        student = user_service.update_profile(student_id, data)
        return jsonify({
            "success": True,
            "message": "Profile updated successfully.",
            "student": student,
        }), 200

    return user_bp
