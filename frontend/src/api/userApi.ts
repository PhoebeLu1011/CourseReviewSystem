import { API_BASE_URL } from "../config/api";

export type Role = "Student" | "Admin";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  email?: string;
  department?: string;
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
  };
  user?: {
    studentID?: string;
    id?: string;
    name?: string;
    email?: string;
    department?: string;
    role?: Role;
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  let data: any = {};

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