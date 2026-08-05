// ?? (not ||) matters here: the production build sets VITE_API_URL="" on
// purpose (same-origin requests once frontend/backend share a deployment),
// and "" is falsy — || would wrongly fall back to the dev default below.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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

// Paths that must never trigger a refresh-and-retry themselves — retrying
// them on a 401 either makes no sense (refresh failing) or risks a loop.
const NO_RETRY_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

// Cookies are host-scoped: a native app shell's own origin (always
// "capacitor://localhost" on iOS, whatever hostname is configured on
// Android) is never the same host as the API, so document.cookie can never
// see the CSRF cookie at all — that's not a SameSite/Secure problem, it's
// just how cookies work. The API also echoes the current token back as a
// response header (which a same-origin-to-itself fetch call CAN read), so
// that's the real source of truth; the cookie read is only a same-site
// (web app) convenience fallback.
let csrfTokenMemory = null;

// WKWebView's Intelligent Tracking Prevention was observed dropping even
// httpOnly cookies set via a cross-origin JS-initiated request, so the
// access_token cookie can silently fail to persist even within one app
// session. Held in memory only — never written to localStorage/Preferences/
// any persistent store — and sent as `Authorization: Bearer` instead of
// relying on the cookie. The API echoes a fresh value back on every
// response that issues a session (login/register/refresh), same pattern as
// the CSRF token above.
let accessTokenMemory = null;

// Confirmed by live-device testing: the refresh_token cookie has the exact
// same ITP-related persistence problem as the access_token cookie did — an
// idle session's silent-refresh attempt came back 401 because the cookie
// itself wasn't present on the request. Same fix: hold it in memory only
// (never persisted, per the same rule as the access token) and send it
// explicitly to /auth/refresh instead of relying on the cookie.
//
// This does NOT survive a real force-quit-and-relaunch — a fresh process
// has empty memory, so there's currently no way to silently restore a
// session across an actual app restart. That's a known, deliberately
// deferred gap (would need native secure storage — Keychain/Keystore — to
// solve properly) tracked as a pre-launch item, not fixed here.
let refreshTokenMemory = null;

export function clearInMemoryAuth() {
  csrfTokenMemory = null;
  accessTokenMemory = null;
  refreshTokenMemory = null;
}

// Registered by AuthContext so api.js (a plain module, no React access) can
// signal "the session is definitively over" — refresh itself failed, not
// just the original request — and let the app react globally (clear user
// state, show a real login screen with a clear message) instead of a raw
// error surfacing wherever the failing request happened to be called from.
let sessionExpiredHandler = null;

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

async function rawFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (accessTokenMemory) headers["Authorization"] = `Bearer ${accessTokenMemory}`;

  // Only sent to the one endpoint that actually needs it — no reason to
  // put a 30-day credential on the wire for every ordinary request.
  if (path === "/auth/refresh" && refreshTokenMemory) {
    headers["X-Refresh-Token"] = refreshTokenMemory;
  }

  if (method !== "GET" && method !== "HEAD") {
    const csrfToken = csrfTokenMemory || getCookie("csrf_token");
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const headerToken = res.headers.get("x-csrf-token");
  if (headerToken) csrfTokenMemory = headerToken;

  const headerAccessToken = res.headers.get("x-access-token");
  if (headerAccessToken) accessTokenMemory = headerAccessToken;

  const headerRefreshToken = res.headers.get("x-refresh-token");
  if (headerRefreshToken) refreshTokenMemory = headerRefreshToken;

  if (res.status === 204) return { ok: true, status: 204, data: null };

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

// The access token is short-lived (15 min) by design. Without this, any
// request made after it expires fails outright instead of silently
// refreshing via the refresh token, even though /auth/refresh exists and
// works fine — nothing was ever calling it.
let refreshInFlight = null;

function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = rawFetch("/auth/refresh", { method: "POST" }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function apiFetch(path, options = {}) {
  let result = await rawFetch(path, options);

  if (!result.ok && result.status === 401 && !NO_RETRY_PATHS.includes(path)) {
    const refreshResult = await refreshSession();
    if (refreshResult.ok) {
      result = await rawFetch(path, options);
    } else {
      // Refresh itself failed — the session is genuinely over, not just
      // this one request. Let the app react globally instead of leaving a
      // raw "Not authenticated" wherever this call happened to be made.
      clearInMemoryAuth();
      if (sessionExpiredHandler) sessionExpiredHandler();
    }
  }

  if (!result.ok) {
    throw new ApiError(result.status, result.data?.detail);
  }

  return result.data;
}

export const authApi = {
  register: (email, password, name) =>
    apiFetch("/auth/register", { method: "POST", body: { email, password, name } }),
  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  me: () => apiFetch("/auth/me"),
  updateMe: (payload) => apiFetch("/auth/me", { method: "PATCH", body: payload }),
};

export const mealsApi = {
  list: () => apiFetch("/meals"),
  create: (food) => apiFetch("/meals", { method: "POST", body: { food } }),
  update: (id, { food }) => apiFetch(`/meals/${id}`, { method: "PATCH", body: { food } }),
  remove: (id) => apiFetch(`/meals/${id}`, { method: "DELETE" }),
};

export { ApiError, apiFetch };
