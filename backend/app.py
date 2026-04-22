import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# 引入你根據 UML 寫好的類別
from models import AuthService

# 1. 初始化與環境變數載入
load_dotenv()
uri = os.getenv("MONGO_URI")

app = Flask(__name__)
CORS(app)

# 2. 建立資料庫連線
try:
    # 加入 tlsAllowInvalidCertificates=True 解決 SSL 憑證問題
    client = MongoClient(
        uri, 
        serverSelectionTimeoutMS=5000, 
        tlsAllowInvalidCertificates=True
    )
    # 強制對應雲端已存在的 "Course" (注意大小寫)
    db = client["Course"]
    
    # 測試連線
    client.admin.command('ping')
    print("✅ 成功連線至 MongoDB Atlas！(Database: Course)")
except Exception as e:
    print(f"❌ 連線失敗：{e}")
    db = None

# 3. 實例化 AuthService (將 db 傳入供其操作 user_collection)
auth_service = AuthService(db)

# ==========================================
# 4. API 路由定義 (必須在 app.run 之前)
# ==========================================

@app.route('/')
def home():
    return {"status": "connected" if db is not None else "failed"}

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    # 呼叫 AuthService 的 register 方法 (如 UML 所示)
    success = auth_service.register(
        studentId=data.get('studentId'),
        password=data.get('password'),
        name=data.get('name')
    )
    
    if success:
        return jsonify({"message": "Registration successful"}), 201
    return jsonify({"message": "Student ID already exists"}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # 呼叫 AuthService 的 login 方法 (如 UML 所示)
    success = auth_service.login(
        studentId=data.get('studentId'),
        password=data.get('password')
    )
    
    if success:
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid ID or password"}), 401

# ==========================================
# 5. 啟動伺服器
# ==========================================
if __name__ == '__main__':
    # debug=True 會在存檔時自動重啟伺服器
    app.run(debug=True, port=5000)