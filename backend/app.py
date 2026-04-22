import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. 載入並診斷 .env
load_dotenv()
uri = os.getenv("MONGO_URI")

if not uri:
    print("❌ 錯誤：完全讀取不到 MONGO_URI，請檢查 .env 檔案是否存在於 backend 資料夾。")
else:
    # 隱藏密碼印出，確認格式
    print(f"📡 嘗試連線至: {uri.split('@')[-1]}") 

app = Flask(__name__)
CORS(app)

try:
    # 關鍵修改：加入 tlsAllowInvalidCertificates=True
    client = MongoClient(
        uri, 
        serverSelectionTimeoutMS=5000, 
        tlsAllowInvalidCertificates=True
    )
    db = client[os.getenv("DB_NAME", "course")]
    
    # 測試連線
    client.admin.command('ping')
    print("✅ 成功連線至 MongoDB Atlas！")
except Exception as e:
    print(f"❌ 連線失敗：{e}")
    db = None

@app.route('/')
def home():
    return {"status": "connected" if db is not None else "failed"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)