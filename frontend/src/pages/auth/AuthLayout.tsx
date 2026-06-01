import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// 🔄 配合你後端資料庫的 User 型別定義
interface User {
  id: string;        // 對應後端的 student_id / admin_id
  name: string;      // 姓名
  role: "Student" | "Admin";
  email?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  loginSuccess: (userData: User, token: string) => void; // 🔄 新增：登入成功時將資料寫入狀態與 LocalStorage
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 🔄 初始化：重新整理網頁時，自動從 LocalStorage 恢復真實登入狀態
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 🔄 當後端 API 回傳成功後，呼叫這個函數紀錄狀態
  const loginSuccess = (userData: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}