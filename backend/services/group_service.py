from repository.group_repository import GroupRepository
from models.group import Group
from datetime import datetime
from uuid import uuid4

class GroupService:
    def __init__(self, group_repo: GroupRepository):
        self.group_repo = group_repo

    def _get_group_or_raise(self, group_id: str):
        # fetch group from DB, raise error if not found
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
        max_members: int | None = None,
        needed_members: int | None = None,
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

        deadline = recruitment_deadline
        if isinstance(deadline, str) and deadline.strip():
            deadline = datetime.fromisoformat(deadline)
        elif not deadline:
            deadline = None

        if needed_members is not None:
            needed_count = int(needed_members)
            if needed_count <= 0:
                raise ValueError("needed_members must be greater than 0.")
            group_max_members = needed_count + 1
        elif max_members is not None:
            group_max_members = int(max_members)
        else:
            raise ValueError("needed_members is required.")

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

        self.group_repo.save(group)
        return group

    def remove_member(self, group_id: str, student_id: str):
        group = self._get_group_or_raise(group_id)
        # business logic is handled inside group.remove_member()
        # e.g. leader cannot be removed, student must be in group
        group.remove_member(student_id)
        self.group_repo.save(group)

    def close_recruitment(self, group_id: str):
        group = self._get_group_or_raise(group_id)
        group.close_recruitment()
        self.group_repo.save(group)

    def reopen_recruitment(self, group_id: str):
        group = self._get_group_or_raise(group_id)
        # business logic is handled inside group.reopen_recruitment()
        # e.g. cannot reopen if group is full or deadline has passed
        group.reopen_recruitment()
        self.group_repo.save(group)
