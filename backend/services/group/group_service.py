from repository.group_repository import GroupRepository
from models.group import Group
from datetime import datetime
from uuid import uuid4

UNSET = object()

class GroupService:
    def __init__(
        self,
        group_repo: GroupRepository,
        student_repo,
        course_repo,
        application_repo,
    ):
        self.group_repo = group_repo
        self.student_repo = student_repo
        self.course_repo = course_repo
        self.application_repo = application_repo

    def _get_group_or_raise(self, group_id: str):
        group = self.group_repo.find_by_id(group_id)
        if not group:
            raise ValueError("Group not found.")
        return group

    def get_group(self, group_id: str):
        return self._get_group_or_raise(group_id)

    def create_group(
        self,
        group_name: str,
        course_id: str,
        leader_id: str,
        needed_members: int,
        recruitment_deadline=None,
        description: str | None = None,
        tags: list[str] | None = None,
    ):
        if not group_name or not group_name.strip():
            raise ValueError("group_name is required.")
        if not course_id:
            raise ValueError("course_id is required.")
        if not leader_id:
            raise ValueError("leader_id is required.")
        if not self.student_repo.find_by_id(leader_id):
            raise ValueError("Student not found.")
        if not self.course_repo.find_by_id(course_id):
            raise ValueError("Course not found.")
        if self.group_repo.find_by_course_and_member(course_id, leader_id):
            raise ValueError("Student is already in a group for this course.")

        deadline = recruitment_deadline
        if isinstance(deadline, str) and deadline.strip():
            deadline = datetime.fromisoformat(deadline)
        elif not deadline:
            deadline = None

        if needed_members is None:
            raise ValueError("needed_members is required.")
        needed_count = int(needed_members)
        if needed_count <= 0:
            raise ValueError("needed_members must be greater than 0.")
        group_max_members = needed_count + 1

        if group_max_members < 2:
            raise ValueError("A group must allow at least one member besides the leader.")

        group = Group(
            group_id=f"group-{uuid4().hex}",
            group_name=group_name.strip(),
            course_id=course_id,
            leader_id=leader_id,
            max_members=group_max_members,
            recruitment_deadline=deadline,
            description=description,
            tags=tags or [],
        )

        # Claim first so two concurrent creates cannot place the leader twice.
        if not self.group_repo.claim_course_membership(course_id, leader_id, group.group_id):
            raise ValueError("Student is already in a group for this course.")
        try:
            self.group_repo.save(group)
        except Exception:
            self.group_repo.release_course_membership(course_id, leader_id, group.group_id)
            raise
        return group

    def remove_member(self, group_id: str, student_id: str, leader_id: str):
        group = self._get_group_or_raise(group_id)
        self._validate_leader(group, leader_id)
        group.remove_member(student_id)
        group = self.group_repo.remove_member_if_present(group_id, student_id)
        if not group:
            raise ValueError("Student not in group.")
        self.group_repo.release_course_membership(
            group.course_id,
            student_id,
            group.group_id,
        )
        return group

    def leave_group(self, group_id: str, student_id: str):
        group = self._get_group_or_raise(group_id)
        group.remove_member(student_id)
        group = self.group_repo.remove_member_if_present(group_id, student_id)
        if not group:
            raise ValueError("Student not in group.")
        self.group_repo.release_course_membership(
            group.course_id,
            student_id,
            group.group_id,
        )
        return group

    def edit_group(
        self,
        group_id: str,
        leader_id: str,
        group_name=None,
        needed_members=None,
        recruitment_deadline=UNSET,
        description=UNSET,
        tags=UNSET,
    ):
        group = self._get_group_or_raise(group_id)
        self._validate_leader(group, leader_id)
        max_members = None
        if needed_members is not None:
            needed_count = int(needed_members)
            if needed_count < 0:
                raise ValueError("needed_members cannot be negative.")
            max_members = len(group.members) + needed_count
        group.edit_group_info(
            group_name=group_name,
            max_members=max_members,
        )
        if recruitment_deadline is not UNSET:
            group.set_recruitment_deadline(
                self._parse_deadline(recruitment_deadline)
            )
        if description is not UNSET:
            group.set_description(description)
        if tags is not UNSET:
            group.set_tags(tags or [])
        return self.group_repo.update_group_info(group)

    def transfer_leadership(self, group_id: str, leader_id: str, new_leader_id: str):
        group = self._get_group_or_raise(group_id)
        self._validate_leader(group, leader_id)
        group.transfer_leadership(new_leader_id)
        return self.group_repo.update_leader(group_id, new_leader_id)

    def dissolve_group(self, group_id: str, leader_id: str):
        group = self._get_group_or_raise(group_id)
        self._validate_leader(group, leader_id)
        group.dissolve()
        group = self.group_repo.dissolve(group_id)
        self.application_repo.reject_pending_by_group(group_id, "group_dissolved")
        self.group_repo.release_group_memberships(group_id)
        return group

    def close_recruitment(self, group_id: str, leader_id: str):
        group = self._get_group_or_raise(group_id)
        self._validate_leader(group, leader_id)
        group.close_recruitment()
        group = self.group_repo.update_recruitment_status(group_id, "closed")
        self.application_repo.reject_pending_by_group(group_id, "recruitment_closed")
        return group

    def reopen_recruitment(self, group_id: str, leader_id: str):
        group = self._get_group_or_raise(group_id)
        self._validate_leader(group, leader_id)
        group.reopen_recruitment()
        return self.group_repo.update_recruitment_status(group_id, "open")

    @staticmethod
    def _validate_leader(group: Group, student_id: str):
        if group.leader_id != student_id:
            raise PermissionError("Only the group leader can perform this action.")

    @staticmethod
    def _parse_deadline(deadline):
        if isinstance(deadline, str) and deadline.strip():
            return datetime.fromisoformat(deadline)
        return deadline
