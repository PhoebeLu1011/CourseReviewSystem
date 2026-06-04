import { API_BASE_URL } from "../config/api";

export type Role = "Student" | "Admin";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  email?: string;
  department?: string;
  avatar?: string;
  bio?: string;
  birthday?: string;
  interests?: string[];
}

interface LoginRequest {
  email: string;
  password: string;
  role: Role;
}

interface RegisterRequest {
  studentID: string;
  password: string;
  name: string;
  email: string;
  department: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  student?: {
    studentID?: string;
    id?: string;
    name?: string;
    email?: string;
    department?: string;
    role?: Role;
    avatar?: string;
    bio?: string;
    birthday?: string;
    interests?: string[];
  };
  user?: {
    studentID?: string;
    id?: string;
    name?: string;
    email?: string;
    department?: string;
    role?: Role;
    bio?: string;
    birthday?: string;
    interests?: string[];
    avatar?: string;
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  let data: Partial<AuthResponse> = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || data.error || `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

function normalizeAuthUser(data: AuthResponse, fallbackRole: Role): AuthUser {
  const rawUser = data.student || data.user;

  if (!rawUser) {
    throw new Error("Login succeeded but user data is missing.");
  }

  return {
    id: rawUser.studentID || rawUser.id || "",
    name: rawUser.name || "Student",
    role: rawUser.role || fallbackRole,
    email: rawUser.email,
    department: rawUser.department,
    avatar: (rawUser as any).avatar || "",
    bio: rawUser.bio || "",
    birthday: rawUser.birthday || "",
    interests: rawUser.interests || [],
  };
}

export async function loginUser(payload: LoginRequest): Promise<{
  user: AuthUser;
  token: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      role: payload.role.toLowerCase(),
    }),
  });

  const data = await parseResponse<AuthResponse>(response);

  if (!data.token) {
    throw new Error("Login succeeded but token is missing.");
  }

  return {
    user: normalizeAuthUser(data, payload.role),
    token: data.token,
  };
}

export async function registerUser(payload: RegisterRequest): Promise<{
  user: AuthUser;
  token: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<AuthResponse>(response);

  if (!data.token) {
    throw new Error("Registration succeeded but token is missing.");
  }

  return {
    user: normalizeAuthUser(data, "Student"),
    token: data.token,
  };
}

export async function getProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}


// 科系前後端串接
export interface CollegeData {
  college: string;
  departments: string[];
}

export async function getColleges(): Promise<CollegeData[]> {
  try {
    // 🎯 網址必須改成對應 Flask 的 /api/departments
    const response = await fetch("http://127.0.0.1:5000/api/departments", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    const data = await response.json();
    if (response.ok && data.success) {
      return data.data; // 這樣就能順利拿到 Flask 吐出的 DEPARTMENTS_DATA 了！
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch departments from Flask backend:", error);
    return [];
  }
}

/**
 * 上傳使用者大頭貼到後端 GridFS
 * @param token 儲存在 localStorage 或 AuthContext 中的 JWT Token
 * @param file 檔案物件 (來自 <input type="file" />)
 */
export async function uploadAvatar(token: string, file: File): Promise<{ success: boolean; avatar_id?: string; message?: string }> {
  try {
    const formData = new FormData();
    // 🎯 注意：這裡的 key 名稱必須與後端 request.files['avatar'] 一模一樣
    formData.append("avatar", file);

    const response = await fetch("http://127.0.0.1:5000/api/user/avatar", {
      method: "POST",
      headers: {
        // 🎯 注意：使用 FormData 時，瀏覽器會自動生成 boundary，千萬「不要」手動寫 "Content-Type": "multipart/form-data"
        "Authorization": token, 
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("Upload avatar failed:", error);
    return { success: false, message: "網路連線失敗" };
  }
}
