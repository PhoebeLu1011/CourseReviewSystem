from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

from repository.group_repository import GroupRepository
from repository.application_repository import ApplicationRepository
from repository.notification_repository import NotificationRepository
from repository.student_repository import StudentRepository
from repository.badge_repository import BadgeRepository
from repository.review_repository import ReviewRepository
from repository.course_repository import CourseRepository
from repository.discussion_repository import DiscussionRepository
from repository.reply_repository import ReplyRepository

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

def create_app():
    app = Flask(__name__)
    CORS(app)

    client = MongoClient("mongodb://localhost:27017/")
    db = client["course_system"]

    group_repo = GroupRepository(db)
    application_repo = ApplicationRepository(db)
    notification_repo = NotificationRepository(db)
    student_repo = StudentRepository(db)
    badge_repo = BadgeRepository(db)
    review_repo = ReviewRepository(db)
    course_repo = CourseRepository(db) 
    discussion_repo = DiscussionRepository(db)
    reply_repo = ReplyRepository(db)
    

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

    app.register_blueprint(create_application_routes(application_service))
    app.register_blueprint(create_group_routes(group_recommendation_service))
    app.register_blueprint(create_notification_routes(notification_service))
    app.register_blueprint(create_achievement_routes(achievement_service, student_repo))
    app.register_blueprint(create_review_routes(review_service))
    app.register_blueprint(create_course_routes(course_service)) 
    app.register_blueprint(create_discussion_routes(discussion_service))

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
