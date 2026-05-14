from repository.group_repository import GroupRepository

class GroupService:
    def __init__(self, group_repo: GroupRepository):
        self.group_repo = group_repo

    def _get_group_or_raise(self, group_id: str):
        # fetch group from DB, raise error if not found
        group = self.group_repo.find_by_id(group_id)
        if not group:
            raise ValueError("Group not found.")
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