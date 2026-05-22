import uuid
from models.application import Application


class ApplicationService:
    def __init__(
        self,
        application_repo,
        group_repo,
        student_repo,
        notification_service,
        achievement_service
    ):
        self.application_repo = application_repo
        self.group_repo = group_repo
        self.student_repo = student_repo
        self.notification_service = notification_service
        self.achievement_service = achievement_service

    # =========================
    # Public methods
    # =========================

    def submit_application(
        self,
        student_id: str,
        group_id: str,
        message: str = "",
    ) -> dict:
        group = self._get_group_or_raise(group_id)

        self._validate_group_is_joinable(group)

        self._validate_student_not_in_group(group, student_id)

        self._validate_student_not_in_any_group_in_course(
            student_id,
            group.course_id
        )

        self._validate_student_has_no_pending_application_in_course(
            student_id,
            group.course_id
        )

        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("Student not found.")

        application = Application(
            application_id=str(uuid.uuid4()),
            student_id=student_id,
            group_id=group_id,
            course_id=group.course_id,
            message=message,
        )

        self.application_repo.save(application)

        student.applyCount += 1
        new_badges = self.achievement_service.update_student_badges(student)
        self.student_repo.save(student)

        self._notify_application_submitted(group, application)

        result = application.to_dict()
        result["newBadges"] = [badge.to_dict() for badge in new_badges]

        return result

    def apply_to_group(
        self,
        student_id: str,
        group_id: str,
        message: str = "",
    ) -> dict:
        return self.submit_application(student_id, group_id, message)

    def cancel_application(
        self,
        application_id: str,
        student_id: str
    ) -> Application:
        application = self._get_application_or_raise(application_id)

        if application.student_id != student_id:
            raise ValueError("Student cannot cancel this application.")

        self._validate_application_is_pending(application)

        application.cancel()
        self.application_repo.save(application)

        return application

    def approve_application(
        self,
        application_id: str,
        leader_id: str
    ) -> Application:
        application = self._get_application_or_raise(application_id)
        group = self._get_group_or_raise(application.group_id)

        self._validate_leader_permission(group, leader_id)
        self._validate_application_is_pending(application)
        self._validate_student_not_in_group(group, application.student_id)
        self._validate_group_is_joinable(group)

        application.approve()
        group.add_member(application.student_id)

        group_is_full = group.is_full()

        if group_is_full:
            group.close_recruitment()

        self.application_repo.save(application)
        self.group_repo.save(group)

        self._notify_application_approved(application)

        if group_is_full:
            self._notify_recruitment_closed_because_group_full(group)
            self._reject_other_pending_applications_if_group_full(
                group_id=group.group_id,
                approved_application_id=application.application_id,
            )

        return application

    def reject_application(
        self,
        application_id: str,
        leader_id: str
    ) -> Application:
        application = self._get_application_or_raise(application_id)
        group = self._get_group_or_raise(application.group_id)

        self._validate_leader_permission(group, leader_id)
        self._validate_application_is_pending(application)

        application.reject(reason="leader_rejected")
        self.application_repo.save(application)

        self._notify_application_rejected(application)

        return application

    def list_pending_applications_for_group(
        self,
        group_id: str,
        leader_id: str
    ) -> list:
        group = self._get_group_or_raise(group_id)
        self._validate_leader_permission(group, leader_id)

        return self.application_repo.find_pending_by_group(group_id)

    def list_pending_applications_for_student(
        self,
        student_id: str
    ) -> list:
        return self.application_repo.find_pending_by_student(student_id)

    # =========================
    # Private helpers: getters
    # =========================

    def _get_application_or_raise(
        self,
        application_id: str
    ) -> Application:
        application = self.application_repo.find_by_id(application_id)

        if not application:
            raise ValueError("Application not found.")

        return application

    def _get_group_or_raise(self, group_id: str):
        group = self.group_repo.find_by_id(group_id)

        if not group:
            raise ValueError("Group not found.")

        return group

    # =========================
    # Private helpers: validation
    # =========================

    def _validate_leader_permission(
        self,
        group,
        leader_id: str
    ) -> None:
        if group.leader_id != leader_id:
            raise ValueError("Only the group leader can perform this action.")

    def _validate_application_is_pending(
        self,
        application: Application
    ) -> None:
        if not application.is_pending():
            raise ValueError("Only pending applications can be processed.")

    def _validate_group_is_joinable(self, group) -> None:
        if not group.is_joinable():
            raise ValueError("Group is not accepting applications.")

    def _validate_student_not_in_group(
        self,
        group,
        student_id: str
    ) -> None:
        if group.has_member(student_id):
            raise ValueError("Student is already in the group.")

    def _validate_student_not_in_any_group_in_course(
        self,
        student_id: str,
        course_id: str
    ) -> None:
        existing_group = self.group_repo.find_by_course_and_member(
            course_id,
            student_id
        )

        if existing_group:
            raise ValueError(
                "Student is already in a group for this course."
            )

    def _validate_student_has_no_pending_application_in_course(
        self,
        student_id: str,
        course_id: str
    ) -> None:
        existing_pending = (
            self.application_repo.find_pending_by_student_and_course(
                student_id,
                course_id
            )
        )

        if existing_pending:
            raise ValueError(
                "Student already has a pending application in this course."
            )

    # =========================
    # Private helpers: auto reject
    # =========================

    def _reject_other_pending_applications_if_group_full(
        self,
        group_id: str,
        approved_application_id: str,
    ) -> None:
        group = self._get_group_or_raise(group_id)

        if not group.is_full():
            return

        other_pending_apps = self.application_repo.find_pending_by_group(
            group_id
        )

        for other_app in other_pending_apps:
            if other_app.application_id == approved_application_id:
                continue

            if other_app.is_pending():
                other_app.reject(reason="group_full")
                self.application_repo.save(other_app)
                self._notify_group_full_auto_rejected(other_app)

    # =========================
    # Private helpers: notifications
    # =========================

    def _notify_application_submitted(self, group, application: Application) -> None:
        self.notification_service.create_notification(
            receiver_id=group.leader_id,
            content="A new application has been submitted to your group.",
            type="application_submitted",
            related_id=application.application_id,
        )

    def _notify_application_approved(self, application: Application) -> None:
        self.notification_service.create_notification(
            receiver_id=application.student_id,
            content="Your application has been approved.",
            type="application_approved",
            related_id=application.application_id,
        )

    def _notify_application_rejected(self, application: Application) -> None:
        self.notification_service.create_notification(
            receiver_id=application.student_id,
            content="Your application has been rejected.",
            type="application_rejected",
            related_id=application.application_id,
        )

    def _notify_group_full_auto_rejected(self, application: Application) -> None:
        self.notification_service.create_notification(
            receiver_id=application.student_id,
            content="Your application has been rejected because the group is full.",
            type="group_full_auto_rejected",
            related_id=application.application_id,
        )

    def _notify_recruitment_closed_because_group_full(self, group) -> None:
        self.notification_service.create_notification(
            receiver_id=group.leader_id,
            content="Your group is full. Recruitment has been closed automatically.",
            type="group_full_recruitment_closed",
            related_id=group.group_id,
        )