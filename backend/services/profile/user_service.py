from repository.student_repository import StudentRepository


class UserService:
    ALLOWED_PROFILE_FIELDS = {"name", "bio", "birthday", "interests"}

    def __init__(self, student_repo: StudentRepository, avatar_storage=None):
        self.student_repo = student_repo
        self.avatar_storage = avatar_storage

    def get_profile(self, student_id):
        return self._get_student_or_raise(student_id).to_public_dict()

    def update_profile(self, student_id, data):
        unknown_fields = set(data) - self.ALLOWED_PROFILE_FIELDS
        if unknown_fields:
            raise ValueError(f"Unsupported profile fields: {sorted(unknown_fields)}")

        student = self._get_student_or_raise(student_id)
        student.update_profile(**data)
        self.student_repo.save(student)
        return student.to_public_dict()

    def upload_avatar(self, student_id, file):
        if not self.avatar_storage:
            raise ValueError("Avatar storage is not configured.")

        student = self._get_student_or_raise(student_id)
        old_avatar_id = student.avatar
        new_avatar_id = self.avatar_storage.store(file)
        try:
            student.update_avatar(new_avatar_id)
            self.student_repo.save(student)
        except Exception:
            self.avatar_storage.delete(new_avatar_id)
            raise

        if old_avatar_id:
            try:
                self.avatar_storage.delete(old_avatar_id)
            except Exception:
                pass
        return new_avatar_id

    def get_avatar(self, avatar_id):
        if not self.avatar_storage:
            raise ValueError("Avatar storage is not configured.")
        try:
            return self.avatar_storage.get(avatar_id)
        except Exception as error:
            raise ValueError("Avatar not found.") from error

    def _get_student_or_raise(self, student_id):
        student = self.student_repo.find_by_id(student_id)
        if not student:
            raise ValueError("User not found.")
        return student
