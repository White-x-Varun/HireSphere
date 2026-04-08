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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};
