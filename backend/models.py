from werkzeug.security import generate_password_hash, check_password_hash

# 對應 UML 中的 User (父類別)
class User:
    def __init__(self):
        pass

# 對應 UML 中的 Student (繼承 User)
class Student(User):
    def __init__(self, studentId, password, name, email):
        super().__init__()
        self.studentId = studentId  # UML 中的 +studentId (Public)
        self._password = generate_password_hash(password) # UML 中的 -password (Private)
        self.name = name            # UML 中的 +name
        self.email = email          # UML 中的 +email

    def updateProfile(self, name, email):
        """UML 中的 +updateProfile()"""
        self.name = name
        self.email = email
        return True

    def resetPassword(self, newPwd):
        """UML 中的 +resetPassword()"""
        self._password = generate_password_hash(newPwd)
        return True

    def to_dict(self):
        """輔助方法：將物件轉為 MongoDB 儲存格式"""
        return {
            "studentId": self.studentId,
            "password": self._password,
            "name": self.name,
            "email": self.email
        }

# 對應 UML 中的 AuthService
class AuthService:
    def __init__(self, db):
        # UML 中的 -userList，這裡對應到 MongoDB 的 users collection
        self.user_collection = db.users

    def register(self, studentId, password, name):
        """UML 中的 +register()"""
        # 檢查是否已存在
        if self.user_collection.find_one({"studentId": studentId}):
            print(f"❌ 註冊失敗：ID {studentId} 已存在")
            return False
        
        # 建立 Student 物件並存檔
        new_student = Student(
            studentId=studentId, 
            password=password, 
            name=name, 
            email=f"{studentId}@school.edu.tw" # 預設 Email 生成
        )
        self.user_collection.insert_one(new_student.to_dict())
        print(f"✅ 學生 {name} 註冊成功")
        return True

    def login(self, studentId, password):
        """UML 中的 +login()"""
        user_data = self.user_collection.find_one({"studentId": studentId})
        if user_data and check_password_hash(user_data['password'], password):
            print(f"✅ 學生 {studentId} 登入成功")
            return True
        print("❌ 登入失敗：帳號或密碼錯誤")
        return False