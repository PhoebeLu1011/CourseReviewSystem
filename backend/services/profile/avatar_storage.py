from dataclasses import dataclass

from bson.objectid import ObjectId


@dataclass(frozen=True)
class AvatarFile:
    content: bytes
    content_type: str


class GridFSAvatarStorage:
    """Adapter that keeps GridFS details outside the profile use case."""

    ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024

    def __init__(self, fs):
        self.fs = fs

    def store(self, file):
        if not file:
            raise ValueError("Avatar file is required.")
        if file.content_type not in self.ALLOWED_CONTENT_TYPES:
            raise ValueError("Avatar must be a JPEG, PNG, or WebP image.")

        content = file.read()
        if not content:
            raise ValueError("Avatar file cannot be empty.")
        if len(content) > self.MAX_FILE_SIZE:
            raise ValueError("Avatar file cannot exceed 5 MB.")

        return str(self.fs.put(
            content,
            filename=file.filename,
            content_type=file.content_type,
        ))

    def delete(self, avatar_id):
        if avatar_id:
            self.fs.delete(ObjectId(avatar_id))

    def get(self, avatar_id):
        grid_out = self.fs.get(ObjectId(avatar_id))
        return AvatarFile(
            content=grid_out.read(),
            content_type=grid_out.content_type or "image/jpeg",
        )
