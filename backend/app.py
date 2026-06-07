import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from mongo import db, fs



from services.auth.auth_service import AuthService
from services.auth.password_service import PasswordService
from services.auth.token_service import TokenService
from services.auth.authorization_service import AuthorizationService
from services.profile.user_service import UserService
from services.profile.avatar_storage import GridFSAvatarStorage
from services.admin.admin_service import AdminService
from services.admin.admin_analytics_service import AdminAnalyticsService
from services.communication.announcement_service import AnnouncementService
from services.communication.report_service import ReportService

from routes.auth_routes import create_auth_routes
from routes.user_routes import create_user_routes
from routes.admin_routes import create_admin_routes
from routes.report_routes import create_report_routes
from routes.announcement_routes import create_announcement_routes

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
from repository.bookmark_repository import BookmarkRepository
from repository.schedule_repository import ScheduleRepository

from services.group.application_service import ApplicationService
from services.communication.notification_service import NotificationService, BestEffortNotificationPublisher
from services.group.group_service import GroupService
from services.group.group_management_facade import GroupManagementFacade
from services.group.group_recommendation_service import GroupRecommendationService
from services.engagement.achievement_service import AchievementService
from services.course.course_service import CourseService
from services.review.course_rating_synchronizer import CourseRatingSynchronizer
from services.review.review_service import ReviewService
from services.discussion.discussion_service import DiscussionService
from services.engagement.favorite_service import FavoriteService
from services.engagement.schedule_service import ScheduleService

from routes.application_routes import create_application_routes
from routes.group_routes import create_group_routes
from routes.notification_routes import create_notification_routes
from routes.achievement_routes import create_achievement_routes
from routes.review_routes import create_review_routes
from routes.course_routes import create_course_routes
from routes.discussion_routes import create_discussion_routes
from routes.bookmark_routes import create_bookmark_routes
from routes.schedule_routes import create_schedule_routes


load_dotenv()


def create_app():
    app = Flask(__name__)

    # ====== CORS 設定 ======
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    allowed_origins = list({
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        frontend_url,
    })

    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
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
    bookmark_repo = BookmarkRepository(db)
    schedule_repo = ScheduleRepository(db)

    # ====== Services ======
    password_service = PasswordService()
    token_service = TokenService()
    authorization_service = AuthorizationService(token_service)

    auth_service = AuthService(
        student_repo=student_repo,
        password_service=password_service,
        token_service=token_service
    )
    user_service = UserService(
        student_repo=student_repo,
        avatar_storage=GridFSAvatarStorage(fs),
    )
    notification_service = NotificationService(notification_repo)
    notification_publisher = BestEffortNotificationPublisher(notification_service)
    achievement_service = AchievementService(badge_repo, student_repo)
    course_service = CourseService(course_repo)
    course_rating_synchronizer = CourseRatingSynchronizer(course_repo, review_repo)
    review_service = ReviewService(
        review_repo,
        student_repo,
        course_repo,
        course_rating_synchronizer,
    )

    discussion_service = DiscussionService(
        discussion_repo=discussion_repo,
        reply_repo=reply_repo,
        student_repo=student_repo,
        course_repo=course_repo,
    )

    application_service = ApplicationService(
        application_repo=application_repo,
        group_repo=group_repo,
        student_repo=student_repo,
        notification_publisher=notification_publisher,
        achievement_service=achievement_service,
    )

    group_service = GroupService(
        group_repo,
        student_repo,
        course_repo,
        application_repo,
    )
    group_management_facade = GroupManagementFacade(group_repo, application_repo)
    group_recommendation_service = GroupRecommendationService(
        group_repo,
        application_repo,
    )

    admin_service = AdminService(
        report_repo=report_repo,
        review_repo=review_repo,
        reply_repo=reply_repo,
        discussion_repo=discussion_repo,
        group_repo=group_repo,
        rating_synchronizer=course_rating_synchronizer,
    )
    admin_analytics_service = AdminAnalyticsService(report_repo, announcement_repo)
    announcement_service = AnnouncementService(announcement_repo)
    report_service = ReportService(
        report_repo,
        target_readers={
            "review": review_repo.find_by_id,
            "comment": reply_repo.find_by_id_or_legacy_id,
            "teammate_post": group_repo.find_by_id_or_legacy_id,
        },
    )
    favorite_service = FavoriteService(bookmark_repo, student_repo, course_repo)
    schedule_service = ScheduleService(schedule_repo, student_repo, course_repo)

    # ====== Register Blueprints ======
    app.register_blueprint(create_application_routes(application_service, authorization_service))
    app.register_blueprint(
        create_group_routes(
            group_recommendation_service,
            group_service,
            group_management_facade,
            authorization_service,
        )
    )
    app.register_blueprint(create_notification_routes(notification_service, authorization_service))
    app.register_blueprint(create_achievement_routes(achievement_service, student_repo, authorization_service))
    app.register_blueprint(create_review_routes(review_service, authorization_service))
    app.register_blueprint(create_course_routes(course_service))
    app.register_blueprint(create_discussion_routes(discussion_service, authorization_service))
    app.register_blueprint(create_bookmark_routes(favorite_service, authorization_service))
    app.register_blueprint(create_schedule_routes(schedule_service, authorization_service))
    app.register_blueprint(
        create_admin_routes(
            admin_service,
            announcement_service,
            authorization_service,
            admin_analytics_service,
        )
    )
    app.register_blueprint(create_announcement_routes(announcement_service))
    app.register_blueprint(create_report_routes(report_service, authorization_service))

    app.register_blueprint(create_auth_routes(auth_service), url_prefix="/api/auth")
    app.register_blueprint(
        create_user_routes(user_service, authorization_service),
        url_prefix="/api/user",
    )

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5001))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.getenv("FLASK_ENV") != "production",
        threaded=True,
        use_reloader=False
    )
