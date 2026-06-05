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

interface BackendUser {
  studentID?: string;
  id?: string;
  name?: string;
  email?: string;
  department?: string;
  role?: Role | string;
  avatar?: string;
  bio?: string;
  birthday?: string;
  interests?: string[];
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  student?: BackendUser;
  user?: BackendUser;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
  student?: BackendUser;
  user?: BackendUser;
}

export interface CollegeData {
  college: string;
  departments: string[];
}

interface CollegeResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: CollegeData[];
}

export interface UploadAvatarResponse {
  success: boolean;
  avatar_id?: string;
  message?: string;
  error?: string;
}

async function parseResponse<T extends { success?: boolean; message?: string; error?: string }>(
  response: Response
): Promise<T> {
  let data: T | null = null;

  try {
    data = (await response.json()) as T;
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`
    );
  }

  if (!data) {
    throw new Error("後端沒有回傳有效的 JSON 資料。");
  }

  return data;
}

function normalizeRole(role: BackendUser["role"], fallbackRole: Role): Role {
  if (role === "Admin" || role === "admin") return "Admin";
  if (role === "Student" || role === "student") return "Student";
  return fallbackRole;
}

function normalizeAuthUser(data: AuthResponse | ProfileResponse, fallbackRole: Role): AuthUser {
  const rawUser = data.student || data.user;

  if (!rawUser) {
    throw new Error("操作成功，但後端沒有回傳使用者資料。");
  }

  return {
    id: rawUser.studentID || rawUser.id || "",
    name: rawUser.name || "Student",
    role: normalizeRole(rawUser.role, fallbackRole),
    email: rawUser.email || "",
    department: rawUser.department || "",
    avatar: rawUser.avatar || "",
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
    throw new Error("登入成功，但後端沒有回傳 token。");
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
    throw new Error("註冊成功，但後端沒有回傳 token。");
  }

  return {
    user: normalizeAuthUser(data, "Student"),
    token: data.token,
  };
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<ProfileResponse>(response);
}

export async function getColleges(): Promise<CollegeData[]> {
  try {
    // 如果你的後端路由是 /api/departments，就把這行改成：
    // const response = await fetch(`${API_BASE_URL}/api/departments`);
    const response = await fetch(`${API_BASE_URL}/api/user/departments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await parseResponse<CollegeResponse>(response);
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch departments from backend:", error);
    return [];
  }
}

export async function uploadAvatar(
  token: string,
  file: File
): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse<UploadAvatarResponse>(response);
}
