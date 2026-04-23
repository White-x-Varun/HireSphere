// Custom fetch that adds Authorization header from localStorage
export function getToken(): string | null {
  return localStorage.getItem("job_portal_token");
}

export function setToken(token: string): void {
  localStorage.setItem("job_portal_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("job_portal_token");
}

export const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

export const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const res = await customFetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
};
