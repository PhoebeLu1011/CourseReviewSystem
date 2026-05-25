import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# 🔐 引入你開發的認證與用戶模組
from services.auth_service import AuthService
from routes.auth_routes import create_auth_routes
from services.user_service import UserService       
from routes.user_routes import create_user_routes

# 🏛️ 引入所有 Repository (包含你的與組長的)
from repository.group_repository import GroupRepository
from repository.application_repository import ApplicationRepository
from repository.notification_repository import NotificationRepository
from repository.student_repository import StudentRepository
from repository.badge_repository import BadgeRepository
from repository.review_repository import ReviewRepository
from repository.course_repository import CourseRepository
from repository.discussion_repository import DiscussionRepository
from repository.reply_repository import ReplyRepository

# ⚙️ 引入所有 Services
from services.application_service import ApplicationService
from services.notification_service import NotificationService
from services.group_recommendation_service import GroupRecommendationService
from services.achievement_service import AchievementService
from services.course_service import CourseService 
from services.review_service import ReviewService
from services.discussion_service import DiscussionService

# 🌐 引入所有 Routes (Blueprints)
from routes.application_routes import create_application_routes
from routes.group_routes import create_group_routes
from routes.notification_routes import create_notification_routes
from routes.achievement_routes import create_achievement_routes
from routes.review_routes import create_review_routes
from routes.course_routes import create_course_routes
from routes.discussion_routes import create_discussion_routes

# 🔑 載入環境變數
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 💾 讀取環境變數中的 MongoDB URI，若無則使用預設值
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    
    # 💡 這裡配合組長先前的設定，連接到 course_system 資料庫
    db = client["course_system"]

    # 🏗️ 初始化所有 Repository
    group_repo = GroupRepository(db)
    application_repo = ApplicationRepository(db)
    notification_repo = NotificationRepository(db)
    student_repo = StudentRepository(db)
    badge_repo = BadgeRepository(db)
    review_repo = ReviewRepository(db)
    course_repo = CourseRepository(db) 
    discussion_repo = DiscussionRepository(db)
    reply_repo = ReplyRepository(db)
    
    # 🔐 初始化你寫的 Auth 與 User Service
    auth_service = AuthService(student_repo)
    user_service = UserService(student_repo)

    # ⚙️ 初始化組長與其他的 Service
    notification_service = NotificationService(notification_repo)
    achievement_service = AchievementService(badge_repo)
    review_service = ReviewService(review_repo, student_repo)
    course_service = CourseService(course_repo)

    discussion_service = DiscussionService(
        discussion_repo=discussion_repo,
        reply_repo=reply_repo,
        student_repo=student_repo,
        course_service=course_service
    )

    application_service = ApplicationService(
        application_repo=application_repo,
        group_repo=group_repo,
        student_repo=student_repo,
        notification_service=notification_service,
        achievement_service=achievement_service,
    )

    group_recommendation_service = GroupRecommendationService(group_repo)

    # 🔗 註冊組長的所有路由
    app.register_blueprint(create_application_routes(application_service))
    app.register_blueprint(create_group_routes(group_recommendation_service))
    app.register_blueprint(create_notification_routes(notification_service))
    app.register_blueprint(create_achievement_routes(achievement_service, student_repo))
    app.register_blueprint(create_review_routes(review_service))
    app.register_blueprint(create_course_routes(course_service)) 
    app.register_blueprint(create_discussion_routes(discussion_service))

    # 🔐 註冊你寫的 Auth 與 User 路由
    app.register_blueprint(create_auth_routes(auth_service), url_prefix='/api/auth')
    app.register_blueprint(create_user_routes(user_service), url_prefix='/api/user')
    
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)