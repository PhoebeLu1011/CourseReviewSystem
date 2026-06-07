from datetime import datetime, timezone

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
        visibilityState: str = "VISIBLE",
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
        self.visibilityState = visibilityState
        self.members = self._normalize_members(leader_id, members)

        self._validate()

    @staticmethod
    def _normalize_members(leader_id: str, members: list[str] | None) -> list[str]:
        if members is None:
            return [leader_id]
        unique = list(dict.fromkeys(members))
        if leader_id in unique:
            unique.remove(leader_id)
        return [leader_id, *unique]

    def _validate(self) -> None:
        if self.status not in {"open", "closed"}:
            raise ValueError(f"Invalid group status: {self.status}")
        if self.visibilityState not in {"VISIBLE", "HIDDEN", "DELETED"}:
            raise ValueError(f"Invalid group visibilityState: {self.visibilityState}")
        if len(self.members) > self.max_members:
            raise ValueError("Current member count cannot exceed max_members.")

    def is_full(self) -> bool:
        return len(self.members) >= self.max_members

    def is_open(self) -> bool:
        return self.status == "open"

    def is_visible(self) -> bool:
        return self.visibilityState == "VISIBLE"

    def is_recruitment_open(self) -> bool:
        if self.recruitment_deadline is None:
            return True

        deadline = self.recruitment_deadline

        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

        return datetime.now(timezone.utc) <= deadline
    
    def is_joinable(self) -> bool:
        return (
            self.is_visible()
            and self.is_open()
            and not self.is_full()
            and self.is_recruitment_open()
        )

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

    def transfer_leadership(self, new_leader_id: str) -> None:
        if new_leader_id == self.leader_id:
            raise ValueError("Student is already the group leader.")
        if new_leader_id not in self.members:
            raise ValueError("New leader must already be a group member.")
        self.leader_id = new_leader_id
        self.members.remove(new_leader_id)
        self.members.insert(0, new_leader_id)

    def dissolve(self) -> None:
        self.status = "closed"
        self.visibilityState = "DELETED"

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
            if max_members < 2:
                raise ValueError("A group must allow at least two members.")
            if max_members < len(self.members):
                raise ValueError("max_members cannot be smaller than current member count.")
            self.max_members = max_members

        if recruitment_deadline is not None:
            self.recruitment_deadline = recruitment_deadline

        if description is not None:
            self.description = description

        if tags is not None:
            self.tags = tags

    def set_recruitment_deadline(self, deadline: datetime | None) -> None:
        self.recruitment_deadline = deadline

    def set_description(self, description: str | None) -> None:
        self.description = description

    def set_tags(self, tags: list[str]) -> None:
        self.tags = tags

    def to_dict(self) -> dict:
        needed_members = max(self.max_members - len(self.members), 0)

        return {
            "group_id": self.group_id,
            "group_name": self.group_name,
            "course_id": self.course_id,
            "leader_id": self.leader_id,
            "max_members": self.max_members,
            "needed_members": needed_members,
            "members": self.members,
            "status": self.status,
            "recruitment_deadline": (
                self.recruitment_deadline.isoformat()
                if self.recruitment_deadline else None
            ),
            "description": self.description,
            "tags": self.tags,
            "visibilityState": self.visibilityState,
        }

    def to_persistence_dict(self) -> dict:
        data = self.to_dict()
        data["recruitment_deadline"] = self.recruitment_deadline
        return data
