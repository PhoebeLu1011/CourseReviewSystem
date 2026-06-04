from models.review import Review
from models.report import Report

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
            "role": self.role
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
        reviewCount=0,
        replyCount=0,
        applyCount=0,
        role="student",
        bio="No bio provided yet.",
        birthday="2000-01-01",
        interests=None
    ):
        super().__init__(id=id, name=name, email=email, role=role, avatar=avatar)
        self.department = department
        self.studentID = studentID
        self.password = password
        self.reviewCount = reviewCount
        self.replyCount = replyCount
        self.applyCount = applyCount
        
        
        self.bio = bio
        self.birthday = birthday
        self.interests = interests if interests is not None else []

    def to_dict(self):
        data = super().to_dict()
       
        data.update({
            "password": self.password,
            "department": self.department,
            "studentID": self.studentID,
            "reviewCount": self.reviewCount,
            "replyCount": self.replyCount,
            "applyCount": self.applyCount,
            "bio": self.bio,
            "birthday": self.birthday,
            "interests": self.interests
        })
        return data
    
    def leave_review(self, courseID, content, sweetnessScore, workloadScore):
        new_review = Review(
            authorID=self.studentID, 
            courseID=courseID, 
            content=content, 
            sweetnessScore=sweetnessScore, 
            workloadScore=workloadScore
        )
        self.reviewCount += 1
        return new_review

    def file_report(self, target_review_id, reason):
        new_report = Report(
            reviewID=target_review_id,
            reporterID=self.studentID,
            reason=reason
        )
        return new_report

class Admin(User):
    def __init__(self, id, name, email, role="admin", avatar=None):
        super().__init__(id=id, name=name, email=email, role=role, avatar=avatar)