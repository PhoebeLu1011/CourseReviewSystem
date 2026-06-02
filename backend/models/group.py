from datetime import datetime

class Group:
    def __init__(
        self,
        group_id: str,
        group_name: str,
        course_id: str,
        leader_id: str,
        max_members: int,
        members: list[str] | None = None,
        status: str = "open",   # open | closed
        recruitment_deadline: datetime | None = None,
        description: str | None = None,
        tags: list[str] | None = None,
    ):
        if max_members <= 0:
            raise ValueError("max_members must be greater than 0.")

        self.group_id = group_id
        self.group_name = group_name
        self.course_id = course_id
        self.leader_id = leader_id
        self.max_members = max_members
        self.status = status
        self.recruitment_deadline = recruitment_deadline
        self.description = description
        self.tags = tags or []
        self.members = self._normalize_members(leader_id, members)

        self._validate()

    @staticmethod
    def _normalize_members(leader_id: str, members: list[str] | None) -> list[str]:
        if members is None:
            return [leader_id]
        unique = list(dict.fromkeys(members))
        # leader must always be the first member in the list
        if leader_id not in unique:
            unique.insert(0, leader_id)
        return unique

    def _validate(self) -> None:
        if self.status not in {"open", "closed"}:
            raise ValueError(f"Invalid group status: {self.status}")
        if len(self.members) > self.max_members:
            raise ValueError("Current member count cannot exceed max_members.")

    def is_full(self) -> bool:
        return len(self.members) >= self.max_members

    def is_open(self) -> bool:
        return self.status == "open"

    def is_recruitment_open(self) -> bool:
        if self.recruitment_deadline is None:
            return True
        return datetime.now() <= self.recruitment_deadline

    def is_joinable(self) -> bool:
        return self.is_open() and not self.is_full() and self.is_recruitment_open()

    def has_member(self, student_id: str) -> bool:
        return student_id in self.members

    def add_member(self, student_id: str) -> None:
        if student_id in self.members:
            raise ValueError("Student already in group.")
        if not self.is_joinable():
            raise ValueError("Group is not joinable.")
        self.members.append(student_id)

    def remove_member(self, student_id: str) -> None:
        if student_id == self.leader_id:
            raise ValueError("Leader cannot be removed from the group.")
        if student_id not in self.members:
            raise ValueError("Student not in group.")
        self.members.remove(student_id)

    def close_recruitment(self) -> None:
        self.status = "closed"

    def reopen_recruitment(self) -> None:
        if self.is_full():
            raise ValueError("Cannot reopen recruitment because the group is already full.")
        if not self.is_recruitment_open():
            raise ValueError("Cannot reopen recruitment because recruitment deadline has passed.")
        self.status = "open"

    def edit_group_info(
        self,
        group_name: str | None = None,
        max_members: int | None = None,
        recruitment_deadline: datetime | None = None,
        description: str | None = None,
        tags: list[str] | None = None,
    ) -> None:
        if group_name is not None:
            if not group_name.strip():
                raise ValueError("group_name cannot be empty.")
            self.group_name = group_name.strip()

        if max_members is not None:
            if max_members < len(self.members):
                raise ValueError("max_members cannot be smaller than current member count.")
            self.max_members = max_members

        if recruitment_deadline is not None:
            self.recruitment_deadline = recruitment_deadline

        if description is not None:
            self.description = description

        if tags is not None:
            self.tags = tags

    def to_dict(self) -> dict:
        return {
            "group_id": self.group_id,
            "group_name": self.group_name,
            "course_id": self.course_id,
            "leader_id": self.leader_id,
            "max_members": self.max_members,
            "members": self.members,
            "status": self.status,
            "recruitment_deadline": (
                self.recruitment_deadline.isoformat()
                if self.recruitment_deadline else None
            ),
            "description": self.description,
            "tags": self.tags,
        }