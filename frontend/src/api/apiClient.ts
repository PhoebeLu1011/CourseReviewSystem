export async function parseApiResponse<T>(res: Response): Promise<T> {
  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || data?.success === false) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${res.status}`
    );
  }

  return data as T;
}