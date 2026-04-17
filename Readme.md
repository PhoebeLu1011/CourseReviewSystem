## Git Branch Strategy
### 1. Branch Structure
```bash
main        # 穩定版本（正式版）
develop     # 開發整合分支
usecase/*   # 功能開發分支
```
### 2. Branch說明
- `main`: 
    - 最終版本
    - 只會從 `develop`合併（不要直接push上來這裡！）
- `develop`:
    - 主要開發分支（整合與測試），整合各個 use case 的開發
    - 各功能完成到一定階段後透過 merge Pull Request 合併至此分支
- `usecase/*`:
    - 以 Use Case 為單位進行開發
    - 每個 use case 使用獨立 branch，避免互相干擾
    - 命名規則：
    ```bash
    usecase/功能名稱
    #<ex> usecase/FindGroup
    ```
### 3. 開發Workflow
從 develop 建立新的功能分支：
#### (1) 建立Branch
```bash
git checkout develop
git pull origin develop
git checkout -b usecase/你的功能名稱
```
#### (2) 建立 Pull Request（PR）
git push後 接著在 GitHub 上建立 PR：
從 usecase/* → develop

#### (3) merge to develop

### ！ 提醒
每次開發前請先更新：
```bash
git checkout develop
git pull origin develop
```

## How to run
### 1. Frontend （React）
#### (1) 進入 frontend 資料夾
```bash
cd frontend
```
#### (2) 安裝套件
```bash
npm install
```
#### (3) 啟動
```bash
npm run dev
```

### 2. Backend
#### (1) 進入 backend 資料夾
```bash
cd backend
```
#### (2) 建立虛擬環境 ＆ 安裝套件
```bash
python -m venv venv
source venv/bin/activate   # Mac / Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```
#### (3) 建立 .env
```bash
MONGO_URI=（要自己去mongodb創建一個使用者＋設定密碼，創建完之後會給一個url再把它貼上來）
DB_NAME=Course
```
#### (4) 啟動
```bash
python app.py
```
