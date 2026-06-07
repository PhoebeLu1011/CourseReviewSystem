import { API_BASE_URL } from "../config/api";

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
  includeContentType?: boolean;
};

export function getAuthHeaders(includeContentType = true): Record<string, string> {
  const token = localStorage.getItem("token");

  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
  let data: unknown = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const errorData =
    data && typeof data === "object"
      ? (data as { success?: boolean; message?: string; error?: string })
      : null;

  if (!res.ok || errorData?.success === false) {
    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `Request failed with status ${res.status}`
    );
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  {
    auth = false,
    includeContentType = true,
    headers,
    ...options
  }: ApiRequestOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const defaultHeaders = auth
    ? getAuthHeaders(includeContentType)
    : includeContentType
      ? { "Content-Type": "application/json" }
      : {};

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(headers || {}),
    },
  });

  return parseApiResponse<T>(res);
}
