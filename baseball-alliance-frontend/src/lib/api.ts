const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token: string | null) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  async login(email: string, password: string) {
    return request<{
      token: string;
      user: { id: string; email: string; fullName: string; roles: string[] };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async me() {
    return request<{
      id: string;
      email: string;
      fullName: string;
      roles: string[];
    }>("/auth/me");
  },
};
