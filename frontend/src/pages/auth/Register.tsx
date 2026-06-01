import { useState } from "react";
import { Link,useNavigate } from "react-router";
import { ArrowLeft, User, Lock, Hash, Mail, Building, GraduationCap } from "lucide-react";
import { clsx } from "clsx";

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Foreign Languages",
  "Design and Arts",
  "Physics",
  "Mathematics",
  "Civil Engineering",
  "Information Management"
];

export function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. 檢查二次密碼是否一致
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      // 2. 🚀 發送註冊資料給 Flask 後端
      const response = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 💡 這裡精準對齊你的後端 Model 欄位名稱
          studentID: formData.studentId,
          password: formData.password,
          name: formData.fullName,
          email: formData.email,
          department: formData.department,
          // profilePicURL: "" // 後端已經被你改成選填，所以不傳也沒關係！
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Registration failed");
      }

      // 3. 🎉 註冊成功
      alert("Registration successful! Please login.");
      navigate("/auth/login"); // 引導去登入頁

    } catch (err: any) {
      console.error("Register Error:", err);
      setErrorMsg(err.message || "Connection refused by backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 relative">
      <Link 
        to="/auth/login" 
        className="absolute top-8 left-8 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center -ml-3 -mt-3"
        title="Back to login"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="mb-8 text-center mt-2">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-700">
          <GraduationCap size={24} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
        <p className="text-slate-500 mt-2 font-medium">Join NTNU Toolbox today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Department</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building size={18} />
              </div>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white appearance-none"
                required
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane.doe@ntnu.edu.tw"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Student ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash size={18} />
            </div>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. 41271122H"
              pattern="\d{8}[A-Z]"
              title="8 digits followed by 1 uppercase letter (e.g., 41271122H)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={clsx(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium bg-slate-50 focus:bg-white",
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? "border-rose-400 text-rose-800 bg-rose-50/50" 
                    : "text-slate-800"
                )}
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
