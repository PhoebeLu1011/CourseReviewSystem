import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, User, ShieldAlert, Lock, Hash } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../context/AuthContext";

type Role = "Student" | "Admin";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("Student");
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (role === "Student") {
      const studentIdRegex = /^\d{8}[A-Z]$/;
      if (!studentIdRegex.test(accountId)) {
        setErrorMsg("Student ID must be 8 digits followed by 1 uppercase letter (e.g., 41271122H)");
        return;
      }
    }
    
    login(role);
    navigate("/");
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 mt-2 font-medium">Please sign in to access your account</p>
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-xl mb-8 border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setRole("Student")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
            role === "Student" 
              ? "bg-white text-rose-800 shadow-sm border border-slate-200" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <User size={16} className={role === "Student" ? "text-rose-700" : ""} />
          Student
        </button>
        <button
          onClick={() => setRole("Admin")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
            role === "Admin" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldAlert size={16} className={role === "Admin" ? "text-rose-400" : ""} />
          Admin
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Account ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash size={18} />
            </div>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder={role === "Student" ? "Student ID (e.g. 41271122H)" : "Admin ID"}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
              required
            />
          </div>
          <div className="flex justify-end pt-1">
            <Link 
              to="/auth/forgot-password" 
              className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className={clsx(
            "w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group mt-2",
            role === "Student" 
              ? "bg-rose-700 hover:bg-rose-800 shadow-rose-700/25 hover:shadow-rose-700/40" 
              : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/25 hover:shadow-slate-900/40"
          )}
        >
          {role === "Student" ? "Student Login" : "Admin Login"}
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm font-medium text-slate-500">
          Don't have an account?{" "}
          <Link 
            to="/auth/register" 
            className="font-bold text-rose-700 hover:text-rose-800 hover:underline transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
