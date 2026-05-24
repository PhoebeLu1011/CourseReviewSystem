from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

from services.auth_service import AuthService
from routes.auth_routes import create_auth_routes

from services.user_service import UserService       
from routes.user_routes import create_user_routes

from repository.group_repository import GroupRepository
from repository.application_repository import ApplicationRepository
from repository.notification_repository import NotificationRepository
from repository.student_repository import StudentRepository
from repository.badge_repository import BadgeRepository

from services.application_service import ApplicationService
from services.notification_service import NotificationService
from services.group_recommendation_service import GroupRecommendationService
from services.achievement_service import AchievementService

from routes.application_routes import create_application_routes
from routes.group_routes import create_group_routes
from routes.notification_routes import create_notification_routes
from routes.achievement_routes import create_achievement_routes


def create_app():
    app = Flask(__name__)
    CORS(app)

    client = MongoClient("mongodb+srv://waynebadu_db_user:yjes101019@course01.oij95kr.mongodb.net/")
    db = client["Course"]
    
    group_repo = GroupRepository(db)
    application_repo = ApplicationRepository(db)
    notification_repo = NotificationRepository(db)
    student_repo = StudentRepository(db)
    badge_repo = BadgeRepository(db)

    auth_service = AuthService(student_repo)
    user_service = UserService(student_repo)

    notification_service = NotificationService(notification_repo)
    achievement_service = AchievementService(badge_repo)

    application_service = ApplicationService(
        application_repo=application_repo,
        group_repo=group_repo,
        student_repo=student_repo,
        notification_service=notification_service,
        achievement_service=achievement_service,
    )

    group_recommendation_service = GroupRecommendationService(group_repo)

    app.register_blueprint(create_application_routes(application_service))
    app.register_blueprint(create_group_routes(group_recommendation_service))
    app.register_blueprint(create_notification_routes(notification_service))
    app.register_blueprint(create_achievement_routes(achievement_service, student_repo))
    app.register_blueprint(create_auth_routes(auth_service), url_prefix='/api/auth')
    app.register_blueprint(create_user_routes(user_service), url_prefix='/api/user')
    
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)