import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, User, ShieldAlert, Lock, Mail } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../context/AuthContext";

type Role = "Student" | "Admin";

export function Login() {
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("Student");
  const [email, setEmail] = useState(""); // 🔄 改為綁定 Email
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // 🚀 發送連線給你的 Flask 後端登入 API
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 💡 精准對照你的 auth_service.py：需要 email 與 password
          email: email,
          password: password,
          role: role.toLowerCase()
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Login failed");
      }

      // 🎉 登入成功：把後端回傳的學生資料（data.student）與 Token 存進狀態中
      login({
        id: data.student.studentID || data.student.id,
        name: data.student.name || "Student",
        role: role,
        email: data.student.email,
        department: data.student.department
      }, data.token);

      navigate("/");

    } catch (err: any) {
      console.error("Login Error:", err);
      setErrorMsg(err.message || "Connection refused by backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">Welcome Back</h2>
        <p className="text-sm font-medium text-slate-500">Sign in to manage your courses and reviews</p>
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-xl mb-8 border border-slate-200/50">
        <button
          type="button"
          onClick={() => { setRole("Student"); setErrorMsg(""); }}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all",
            role === "Student" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <User size={16} />
          Student
        </button>
        <button
          type="button"
          onClick={() => { setRole("Admin"); setErrorMsg(""); }}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all",
            role === "Admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <ShieldAlert size={16} />
          Administrator
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-bold text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., jane.doe@ntnu.edu.tw"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium bg-slate-50 focus:bg-white text-slate-800"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium bg-slate-50 focus:bg-white text-slate-800"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={clsx(
            "w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group mt-2",
            isLoading ? "opacity-50 cursor-not-allowed" : "",
            role === "Student" 
              ? "bg-rose-700 hover:bg-rose-800 shadow-rose-700/25 hover:shadow-rose-700/40" 
              : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/25 hover:shadow-slate-900/40"
          )}
        >
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm font-medium text-slate-500">
          Don't have an account?{" "}
          <Link to="/auth/register" className="font-bold text-rose-700 hover:text-rose-800 hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}