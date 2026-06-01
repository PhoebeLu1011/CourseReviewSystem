from models.review import Review
from models.report import Report

class User:
    def __init__(self, id, name, email, role, profilePicURL=None):
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
        password,       
        department,     # 必填
        studentID,      # 必填
        profilePicURL=None, 
        reviewCount=0,
        replyCount=0,
        applyCount=0,
        role="student",
        # 🎯 修正 1：在建構子末端加上新欄位，並賦予安全預設值
        bio="No bio provided yet.",
        birthday="2000-01-01",
        interests=None
    ):
        super().__init__(id=id, name=name, email=email, role=role, profilePicURL=profilePicURL)
        self.department = department
        self.studentID = studentID
        self.password = password
        self.reviewCount = reviewCount
        self.replyCount = replyCount
        self.applyCount = applyCount
        
        # 🎯 修正 2：綁定至物件屬性
        self.bio = bio
        self.birthday = birthday
        self.interests = interests if interests is not None else []

    def to_dict(self):
        data = super().to_dict()
        # 🎯 修正 3：確保 to_dict() 連同新欄位一起打包傳給 Repository 寫入 MongoDB
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
    def __init__(self, id, name, email, role="admin", profilePicURL=None):
        super().__init__(id=id, name=name, email=email, role=role, profilePicURL=profilePicURL)