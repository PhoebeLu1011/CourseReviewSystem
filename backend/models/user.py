from datetime import date


class User:
    def __init__(self, id, name, email, role, avatar=None):
        self.id = id
        self.name = name
        self.email = email
        self.avatar = avatar
        self.role = role

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": self.avatar,
            "role": self.role,
        }


class Student(User):
    def __init__(
        self,
        id,
        name,
        email,
        password,
        department,
        studentID,
        avatar=None,
        profilePicURL=None,
        reviewCount=0,
        replyCount=0,
        applyCount=0,
        role="student",
        bio="No bio provided yet.",
        birthday="2000-01-01",
        interests=None,
        badges=None,
        **kwargs
    ):
        super().__init__(id=id, name=name, email=email, role=role, avatar=avatar)

        self.department = department
        self.studentID = studentID
        self.password = password
        self.reviewCount = reviewCount
        self.replyCount = replyCount
        self.applyCount = applyCount
        self.profilePicURL = profilePicURL or avatar or ""
        self.bio = bio
        self.birthday = birthday
        self.interests = interests if interests is not None else []
        self.badges = badges if badges is not None else {}

    def update_profile(
        self,
        *,
        name=None,
        bio=None,
        birthday=None,
        interests=None,
    ):
        if name is not None:
            self.name = self._required_text(name, "name")
        if bio is not None:
            self.bio = self._optional_text(bio, max_length=500)
        if birthday is not None:
            self.birthday = self._valid_birthday(birthday)
        if interests is not None:
            if not isinstance(interests, list):
                raise ValueError("interests must be a list.")
            self.interests = list(dict.fromkeys(
                str(interest).strip()
                for interest in interests
                if str(interest).strip()
            ))

    def update_avatar(self, avatar_id):
        self.avatar = self._required_text(avatar_id, "avatar_id")
        self.profilePicURL = self.avatar

    @staticmethod
    def _required_text(value, field_name):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field_name} is required.")
        return value.strip()

    @staticmethod
    def _optional_text(value, max_length):
        if not isinstance(value, str):
            raise ValueError("bio must be a string.")
        cleaned = value.strip()
        if len(cleaned) > max_length:
            raise ValueError(f"bio cannot exceed {max_length} characters.")
        return cleaned

    @staticmethod
    def _valid_birthday(value):
        if not isinstance(value, str):
            raise ValueError("birthday must use YYYY-MM-DD format.")
        try:
            birthday = date.fromisoformat(value)
        except ValueError as error:
            raise ValueError("birthday must use YYYY-MM-DD format.") from error
        if birthday > date.today():
            raise ValueError("birthday cannot be in the future.")
        return birthday.isoformat()

    def to_public_dict(self):
        data = super().to_dict()

        data.update({
            "department": self.department,
            "studentID": self.studentID,
            "profilePicURL": self.profilePicURL,
            "reviewCount": self.reviewCount,
            "replyCount": self.replyCount,
            "applyCount": self.applyCount,
            "bio": self.bio,
            "birthday": self.birthday,
            "interests": self.interests,
            "badges": self.badges,
        })

        return data

    def to_persistence_dict(self):
        data = self.to_public_dict()
        data["password"] = self.password
        return data

    def to_dict(self):
        """Return the API-safe representation."""
        return self.to_public_dict()

    def increment_review_count(self):
        self.reviewCount += 1

    def decrement_review_count(self):
        self.reviewCount = max(0, self.reviewCount - 1)

    def increment_apply_count(self):
        self.applyCount += 1

class Admin(User):
    def __init__(self, id, name, email, role="admin", avatar=None):
        super().__init__(id=id, name=name, email=email, role=role, avatar=avatar)
