import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  role: "Student" | "Admin";
}

interface AuthContextType {
  user: User | null;
  login: (role: "Student" | "Admin") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: "Student" | "Admin") => {
    // 目前使用 mock 資料，之後接真實 API 時替換
    setUser({
      id: "S001",
      name: "Test Student",
      role,
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
