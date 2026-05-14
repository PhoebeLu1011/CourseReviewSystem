from models.review import Review
from models.report import Report

class User:
    def __init__(self, id, name, email, profilePicURL, role):
        self.id = id
        self.name = name
        self.email = email
        self.profilePicURL = profilePicURL
        self.role = role

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "profilePicURL": self.profilePicURL,
            "role": self.role
        }


class Student(User):
    def __init__(
        self,
        id,
        name,
        email,
        profilePicURL,
        department,
        studentID,
        reviewCount=0,
        replyCount=0,
        applyCount=0,
        badges=None,
        role="student"

    ):
        super().__init__(id, name, email, profilePicURL, "student")
        self.department = department
        self.studentID = studentID
        self.reviewCount = reviewCount
        self.replyCount = replyCount
        self.applyCount = applyCount
        self.badges = badges if badges is not None else {}
        
        

    def to_dict(self):
        data = super().to_dict()
        data.update({
            "department": self.department,
            "studentID": self.studentID,
            "reviewCount": self.reviewCount,
            "replyCount": self.replyCount,
            "applyCount": self.applyCount,
            "badge": self.badges
        })
        return data


class Admin(User):
    def __init__(self, id, name, email, profilePicURL):
        super().__init__(id, name, email, profilePicURL, "admin")