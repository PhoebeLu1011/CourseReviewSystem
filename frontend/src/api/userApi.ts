import { apiRequest } from "./apiClient";

export type Role = "Student" | "Admin";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  account?: string;
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
  account?: string;
  name?: string;
  email?: string;
  department?: string;
  role?: Role | string;
  avatar?: string;
  bio?: string;
  birthday?: string;
  interests?: string[];
  reviewCount?: number;
  replyCount?: number;
  applyCount?: number;
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
    account: rawUser.account,
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
  const data = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      role: payload.role.toLowerCase(),
    }),
  });

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
  const data = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!data.token) {
    throw new Error("註冊成功，但後端沒有回傳 token。");
  }

  return {
    user: normalizeAuthUser(data, "Student"),
    token: data.token,
  };
}

export async function getProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/api/user/profile", {
    method: "GET",
    auth: true,
  });
}

export async function getColleges(): Promise<CollegeData[]> {
  try {
    const data = await apiRequest<CollegeResponse>("/api/user/departments", {
      method: "GET",
    });

    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch departments from backend:", error);
    return [];
  }
}

export async function uploadAvatar(file: File): Promise<UploadAvatarResponse & { avatar_id: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const data = await apiRequest<UploadAvatarResponse>("/api/user/avatar", {
    method: "POST",
    auth: true,
    includeContentType: false,
    body: formData,
  });

  if (!data.avatar_id) {
    throw new Error("大頭貼上傳成功，但後端沒有回傳 avatar_id。");
  }
  return { ...data, avatar_id: data.avatar_id };
}

export async function updateProfile(
  studentId: string,
  profile: Pick<AuthUser, "name" | "bio" | "birthday" | "interests">
): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>(`/api/user/${encodeURIComponent(studentId)}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(profile),
  });
}
