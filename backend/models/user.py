from models.review import Review
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
        applyCount=0
    ):
        super().__init__(id, name, email, profilePicURL, "student")
        self.department = department
        self.studentID = studentID
        self.reviewCount = reviewCount
        self.replyCount = replyCount
        self.applyCount = applyCount

    def to_dict(self):
        data = super().to_dict()
        data.update({
            "department": self.department,
            "studentID": self.studentID,
            "reviewCount": self.reviewCount,
            "replyCount": self.replyCount,
            "applyCount": self.applyCount
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
    def __init__(self, id, name, email, profilePicURL):
        super().__init__(id, name, email, profilePicURL, "admin")