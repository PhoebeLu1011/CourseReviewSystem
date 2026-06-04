import { useState } from "react";
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

const DEPARTMENTS = [
  {
    "college": "國際與社會科學學院",
    "departments": [
      "全球研究全英語學士學位學程",
      "國際人力資源發展研究所",
      "大眾傳播研究所",
      "東亞學系",
      "歐洲文化與觀光研究所",
      "社會工作學研究所",
      "華語文教學系"
    ]
  },
  {
    "college": "學習資訊專業學院",
    "departments": [
      "圖書資訊學研究所",
      "學習科學學士學位學程",
      "資訊教育研究所"
    ]
  },
  {
    "college": "教育學院",
    "departments": [
      "健康促進與衛生教育學系",
      "公民教育與活動領導學系",
      "幼兒與家庭科學學系",
      "教育學系",
      "教育心理與輔導學系",
      "特殊教育學系",
      "社會教育學系",
      "教育學院學士班",
      "復健諮商與高齡福祉研究所",
      "成癮防制碩士在職學位學程",
      "教育政策與行政研究所",
      "創造力發展碩士在職專班",
      "課程與教學研究所"
    ]
  },
  {
    "college": "文學院",
    "departments": [
      "國文學系",
      "地理學系",
      "歷史學系",
      "翻譯研究所",
      "臺灣史研究所",
      "臺灣語文學系",
      "英語學系"
    ]
  },
  {
    "college": "理學院",
    "departments": [
      "化學系",
      "地球科學系",
      "數學系",
      "永續管理與環境教育研究所",
      "物理學系",
      "科學教育研究所",
      "資訊工程學系"
    ]
  },
  {
    "college": "生命科學專業學院",
    "departments": [
      "營養科學學士暨碩士學位學程",
      "生命科學系",
      "生技醫藥產業碩士學位學程",
      "生物多樣性國際研究生博士學位學程"
    ]
  },
  {
    "college": "科技與工程學院",
    "departments": [
      "光電工程研究所暨學士學位學程",
      "圖文傳播學系",
      "工業教育學系",
      "機電工程學系",
      "科學-科技-工程-STEM整合教育國際博士學位學程",
      "科技應用與人力資源發展學系",
      "車輛與能源工程研究所暨學士學位學程",
      "電機工程學系"
    ]
  },
  {
    "college": "管理學院",
    "departments": [
      "企業管理學系",
      "全球經營與策略研究所",
      "管理研究所",
      "高階經理人企業管理碩士在職專班",
      "國際時尚高階管理碩士在職專班"
    ]
  },
  {
    "college": "藝術學院",
    "departments": [
      "美術學系",
      "藝術史研究所",
      "設計學系",
      "藝術產業高階經理碩士在職專班"
    ]
  },
  {
    "college": "跨域科技產業創新研究學院",
    "departments": [
      "AI 跨域應用研究所",
      "綠能科技與永續治理研究所"
    ]
  },
  {
    "college": "運動與休閒學院",
    "departments": [
      "運動休閒與餐旅管理研究所",
      "運動競技學系",
      "體育與運動科學系",
      "樂活產業高階經理人企業管理碩士在職專班"
    ]
  },
  {
    "college": "音樂學院",
    "departments": [
      "民族音樂研究所",
      "表演藝術學士學位學程",
      "表演藝術研究所",
      "音樂學系",
      "其他"
    ]
  }
];

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      login(user, token);
      

      

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
              
              {/* 🎯 修正二：將舊版單層單選改成支援學院群組的巢狀渲染機制（使用 optgroup） */}

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-slate-800 bg-slate-50 focus:bg-white appearance-none"
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map(group => (
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
          disabled={isSubmitting}
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