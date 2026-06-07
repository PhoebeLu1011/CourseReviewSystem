import uuid
from copy import deepcopy
from dataclasses import dataclass

from models.application import Application


@dataclass(frozen=True)
class ApplicationSubmissionResult:
    application: Application
    new_badges: list

    def to_dict(self) -> dict:
        result = self.application.to_dict()
        result["newBadges"] = [badge.to_dict() for badge in self.new_badges]
        return result


class ApplicationService:
    def __init__(
        self,
        application_repo,
        group_repo,
        student_repo,
        notification_publisher,
        achievement_service
    ):
        self.application_repo = application_repo
        self.group_repo = group_repo
        self.student_repo = student_repo
        self.notification_publisher = notification_publisher
        self.achievement_service = achievement_service

    # =========================
    # Public methods
    # =========================

    def submit_application(
        self,
        student_id: str,
        group_id: str,
        message: str = "",
    ) -> ApplicationSubmissionResult:
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

        original_student = deepcopy(student)
        if not self.application_repo.insert_pending(application):
            raise ValueError(
                "Student already has a pending application in this course."
            )
        try:
            student.increment_apply_count()
            new_badges = self.achievement_service.update_student_badges(student)
            self.student_repo.save(student)
        except Exception:
            self.application_repo.hard_delete_by_id(application.application_id)
            self.student_repo.save(original_student)
            raise

        self.notification_publisher.publish(
            "application_submitted",
            group.leader_id,
            application.application_id,
        )

        return ApplicationSubmissionResult(
            application=application,
            new_badges=new_badges,
        )

    def apply_to_group(
        self,
        student_id: str,
        group_id: str,
        message: str = "",
    ) -> ApplicationSubmissionResult:
        return self.submit_application(student_id, group_id, message)

    def cancel_application(
        self,
        application_id: str,
        student_id: str
    ) -> Application:
        application = self._get_application_or_raise(application_id)

        if application.student_id != student_id:
            raise PermissionError("Student cannot cancel this application.")

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
        self._validate_student_not_in_any_group_in_course(
            application.student_id,
            group.course_id,
        )
        self._validate_group_is_joinable(group)

        # The unique claim protects the cross-group rule before we touch the group document.
        if not self.group_repo.claim_course_membership(
            group.course_id,
            application.student_id,
            group.group_id,
        ):
            raise ValueError("Student is already in a group for this course.")

        updated_group = self.group_repo.add_member_if_joinable(
            group.group_id,
            application.student_id,
        )
        if not updated_group:
            self.group_repo.release_course_membership(
                group.course_id,
                application.student_id,
                group.group_id,
            )
            raise ValueError("Group is not accepting applications.")

        application.approve()
        try:
            self.application_repo.save(application)
        except Exception:
            self.group_repo.remove_member_if_present(
                group.group_id,
                application.student_id,
            )
            self.group_repo.release_course_membership(
                group.course_id,
                application.student_id,
                group.group_id,
            )
            raise

        self.notification_publisher.publish(
            "application_approved",
            application.student_id,
            application.application_id,
        )

        group_is_full = updated_group.is_full()
        if group_is_full:
            updated_group = self.group_repo.close_if_full(group.group_id) or updated_group
            self.notification_publisher.publish(
                "group_full_recruitment_closed",
                updated_group.leader_id,
                updated_group.group_id,
            )
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

        self.notification_publisher.publish(
            "application_rejected",
            application.student_id,
            application.application_id,
        )

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
            raise PermissionError("Only the group leader can perform this action.")

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
                self.notification_publisher.publish(
                    "group_full_auto_rejected",
                    other_app.student_id,
                    other_app.application_id,
                )
