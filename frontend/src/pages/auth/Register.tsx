import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Lock,
  Hash,
  Mail,
  Building,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/userApi";

// 💡 定義後端回傳的科系資料型別結構
interface DepartmentGroup {
  college: string;
  departments: string[];
}

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });

  // 🎯 新增：儲存從後端 API 撈回來的動態科系清單狀態
  const [dbDepartments, setDbDepartments] = useState<DepartmentGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true); // 科系載入狀態
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🎯 核心修改一：頁面載入時，動態對接新路由 '/api/user/departments' 獲取科系
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepts(true);
        const response = await fetch("http://127.0.0.1:5000/api/user/departments");
        const data = await response.json();
        
        if (response.ok && data.success) {
          setDbDepartments(data.data);
        } else {
          console.error("後端回傳獲取科系失敗");
        }
      } catch (err) {
        console.error("無法連線至後端獲取科系清單:", err);
      } finally {
        setIsLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("兩次輸入的密碼不一致。");
      return;
    }

    const studentIdRegex = /^\d{8}[A-Z]$/;
    if (!studentIdRegex.test(formData.studentId)) {
      setErrorMsg(
        "學號格式錯誤，請輸入 8 位數字加 1 個大寫英文字母，例如：41271122H。"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, token } = await registerUser({
        studentID: formData.studentId,
        password: formData.password,
        name: formData.fullName,
        email: formData.email,
        department: formData.department,
      });

      // 🎯 核心修改二：確保註冊成功登入時，user 物件結構包含 avatar 屬性
      const userWithAvatar = {
        ...user,
        avatar: user.avatar || "" // 若剛註冊後端尚未生成 avatar_id，則預設為空字串
      };
      login(result.user, result.token);

      login(userWithAvatar, token);
      navigate("/profile"); 

    } catch (err: any) {
      console.error("Register Error:", err);
      setErrorMsg(err.message || "註冊失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 relative">
      <Link
        to="/auth/login"
        className="absolute top-8 left-8 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center -ml-3 -mt-3"
        title="返回登入"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="mb-8 text-center mt-2">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-700">
          <GraduationCap size={24} />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          建立帳號
        </h2>

        <p className="text-slate-500 mt-2 font-medium">加入 NTNU Toolbox</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">
              姓名
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="請輸入姓名"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">
              系所
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building size={18} />
              </div>
              
              {/* 🎯 核心修改三：動態渲染從後端撈下來的學院與科系（具有 Loading 緩衝提示） */}
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white appearance-none"
                required
                disabled={isSubmitting || isLoadingDepts}
              >
                {isLoadingDepts ? (
                  <option value="" disabled>科系清單載入中...</option>
                ) : (
                  <option value="" disabled>請選擇系所</option>
                )}
                
                {dbDepartments.map(group => (
                  <optgroup key={group.college} label={group.college}>
                    {group.departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">
            電子信箱
          </label>

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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">
            學號
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash size={18} />
            </div>

            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="例如：41271122H"
              pattern="\d{8}[A-Z]"
              title="請輸入 8 位數字加 1 個大寫英文字母，例如：41271122H"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">
              密碼
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="請輸入密碼"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
                required
                disabled={isSubmitting}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                disabled={isSubmitting}
                aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">
              確認密碼
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="請再次輸入密碼"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white"
                required
                disabled={isSubmitting}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                disabled={isSubmitting}
                aria-label={showConfirmPassword ? "隱藏確認密碼" : "顯示確認密碼"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoadingDepts}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "註冊中..." : "建立帳號"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm font-medium text-slate-500">
          已經有帳號了嗎？{" "}
          <Link
            to="/auth/login"
            className="font-bold text-rose-700 hover:text-rose-800 hover:underline transition-colors"
          >
            返回登入
          </Link>
        </p>
      </div>
    </div>
  );
}