from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

from repository.group_repository import GroupRepository
from repository.application_repository import ApplicationRepository
from repository.notification_repository import NotificationRepository

from services.application_service import ApplicationService
from services.notification_service import NotificationService
from services.group_recommendation_service import GroupRecommendationService

from routes.application_routes import create_application_routes
from routes.group_routes import create_group_routes
from routes.notification_routes import create_notification_routes


def create_app():
    app = Flask(__name__)
    CORS(app)

    client = MongoClient("mongodb://localhost:27017/")
    db = client["course_system"]

    group_repo = GroupRepository(db)
    application_repo = ApplicationRepository(db)
    notification_repo = NotificationRepository(db)

    notification_service = NotificationService(notification_repo)
    application_service = ApplicationService(
        application_repo=application_repo,
        group_repo=group_repo,
        notification_service=notification_service,
    )
    group_recommendation_service = GroupRecommendationService(group_repo)

    app.register_blueprint(create_application_routes(application_service))
    app.register_blueprint(create_group_routes(group_recommendation_service))
    app.register_blueprint(create_notification_routes(notification_service))

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)