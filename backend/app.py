import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from mongo import db, fs



from services.auth_service import AuthService
from services.password_service import PasswordService
from services.token_service import TokenService
from services.user_service import UserService
from services.admin_service import AdminService
from services.announcement_service import AnnouncementService
from services.report_service import ReportService

from routes.auth_routes import create_auth_routes
from routes.user_routes import create_user_routes
from routes.admin_routes import create_admin_routes
from routes.report_routes import create_report_routes

from repository.group_repository import GroupRepository
from repository.application_repository import ApplicationRepository
from repository.notification_repository import NotificationRepository
from repository.student_repository import StudentRepository
from repository.badge_repository import BadgeRepository
from repository.review_repository import ReviewRepository
from repository.course_repository import CourseRepository
from repository.discussion_repository import DiscussionRepository
from repository.reply_repository import ReplyRepository
from repository.report_repository import ReportRepository
from repository.announcement_repository import AnnouncementRepository

from services.application_service import ApplicationService
from services.notification_service import NotificationService
from services.group_recommendation_service import GroupRecommendationService
from services.achievement_service import AchievementService
from services.course_service import CourseService
from services.review_service import ReviewService
from services.discussion_service import DiscussionService

from routes.application_routes import create_application_routes
from routes.group_routes import create_group_routes
from routes.notification_routes import create_notification_routes
from routes.achievement_routes import create_achievement_routes
from routes.review_routes import create_review_routes
from routes.course_routes import create_course_routes
from routes.discussion_routes import create_discussion_routes


load_dotenv()


def create_app():
    app = Flask(__name__)


    # ====== CORS 設定 ======
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    CORS(
        app,
        resources={r"/*": {"origins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            frontend_url,
        ]}},
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # ====== Repositories ======
    group_repo = GroupRepository(db)
    application_repo = ApplicationRepository(db)
    notification_repo = NotificationRepository(db)
    student_repo = StudentRepository(db)
    badge_repo = BadgeRepository(db)
    review_repo = ReviewRepository(db)
    course_repo = CourseRepository(db)
    discussion_repo = DiscussionRepository(db)
    reply_repo = ReplyRepository(db)
    report_repo = ReportRepository(db)
    announcement_repo = AnnouncementRepository(db)

    # ====== Services ======
    password_service = PasswordService()
    token_service = TokenService()

    auth_service = AuthService(
        student_repo=student_repo,
        password_service=password_service,
        token_service=token_service
    )
    user_service = UserService(student_repo=student_repo, auth_service=auth_service, fs=fs)
    notification_service = NotificationService(notification_repo)
    achievement_service = AchievementService(badge_repo)
    course_service = CourseService(course_repo)
    review_service = ReviewService(review_repo, student_repo, course_service)
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

    admin_service = AdminService(report_repo=report_repo, review_repo=review_repo)
    announcement_service = AnnouncementService(announcement_repo)
    report_service = ReportService(report_repo)

    app.register_blueprint(create_application_routes(application_service))
    app.register_blueprint(create_group_routes(group_recommendation_service))
    app.register_blueprint(create_notification_routes(notification_service))
    app.register_blueprint(create_achievement_routes(achievement_service, student_repo))
    app.register_blueprint(create_review_routes(review_service))
    app.register_blueprint(create_course_routes(course_service))
    app.register_blueprint(create_discussion_routes(discussion_service))
    app.register_blueprint(create_admin_routes(admin_service, announcement_service))
    app.register_blueprint(create_report_routes(report_service))

    app.register_blueprint(create_auth_routes(auth_service), url_prefix="/api/auth")
    app.register_blueprint(create_user_routes(user_service), url_prefix="/api/user")

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(
        host="127.0.0.1", 
        port=port, 
        debug=os.getenv("FLASK_ENV") != "production",
        threaded=False,
        use_reloader=False
    )

