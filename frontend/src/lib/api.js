const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `Request failed with status ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.detail);
  }

  return data;
}

export const authApi = {
  register: (email, password, name) =>
    apiFetch("/auth/register", { method: "POST", body: { email, password, name } }),
  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  me: () => apiFetch("/auth/me"),
};

export const mealsApi = {
  list: () => apiFetch("/meals"),
  create: (food, goal) => apiFetch("/meals", { method: "POST", body: { food, goal } }),
};

export { ApiError, apiFetch };
