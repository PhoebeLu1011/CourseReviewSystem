export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentID: string;
  department: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  studentID: string;
  department?: string;
  profilePicURL?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthStudent {
  id: string | number | null;
  name: string;
  email: string;
  role: string;
  profilePicURL?: string | null;
  department: string;
  studentID: string;
  reviewCount: number;
  replyCount: number;
  applyCount: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  student?: AuthStudent;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}