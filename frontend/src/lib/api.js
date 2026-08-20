import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

// ?? (not ||) matters here: the production build sets VITE_API_URL="" on
// purpose (same-origin requests once frontend/backend share a deployment),
// and "" is falsy — || would wrongly fall back to the dev default below.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Only ever holds the refresh token — the one credential that actually
// needs to survive a force-quit. Access/CSRF tokens are cheap to reobtain
// via a single silent refresh call, so persisting those too would just be
// more sensitive material sitting in the Keychain/Keystore for no benefit.
const REFRESH_TOKEN_STORAGE_KEY = "fitsense_refresh_token";

// A refresh token authenticating one specific installation syncing to a
// user's other Apple devices via iCloud Keychain isn't the behavior we
// want — each install should hold its own. Set once; applies to every
// operation on this plugin for the life of the process. No-ops on web
// (SecureStorage's own web implementation isn't used here at all).
if (Capacitor.isNativePlatform()) {
  SecureStorage.setSynchronize(false).catch(() => {});
}

function persistRefreshToken(token) {
  if (!Capacitor.isNativePlatform()) return;
  // Fire-and-forget: this is just persistence for the *next* cold start,
  // not something the current request should wait on or fail over.
  SecureStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token).catch(() => {});
}

function clearPersistedRefreshToken() {
  if (!Capacitor.isNativePlatform()) return;
  SecureStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY).catch(() => {});
}

// Called once by AuthContext before its first /auth/me check — a fresh
// native process otherwise has an empty refreshTokenMemory and nothing to
// fall back on, which is exactly the "force-quit logs you out" gap this
// exists to close.
export async function hydrateNativeSession() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const stored = await SecureStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (stored) refreshTokenMemory = stored;
  } catch {
    // No stored token, or the OS declined to release it — same as a
    // logged-out cold start either way.
  }
}

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
// and send it explicitly to /auth/refresh instead of relying on the
// cookie. On native, this is also mirrored into the Keychain/Keystore (see
// persistRefreshToken/hydrateNativeSession above) — this in-memory copy
// stays the one actually sent on every request either way; secure storage
// only exists to repopulate this variable on a fresh process.
let refreshTokenMemory = null;

export function clearInMemoryAuth() {
  csrfTokenMemory = null;
  accessTokenMemory = null;
  refreshTokenMemory = null;
  clearPersistedRefreshToken();
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
  // FormData (photo uploads) must NOT get a hand-set Content-Type — the
  // browser needs to add its own multipart boundary, which only happens if
  // the header is left for fetch to set itself.
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };

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
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const headerToken = res.headers.get("x-csrf-token");
  if (headerToken) csrfTokenMemory = headerToken;

  const headerAccessToken = res.headers.get("x-access-token");
  if (headerAccessToken) accessTokenMemory = headerAccessToken;

  const headerRefreshToken = res.headers.get("x-refresh-token");
  if (headerRefreshToken) {
    refreshTokenMemory = headerRefreshToken;
    // The backend rotates the refresh token on every use (old one is
    // revoked server-side), so this has to run on every issuance — login,
    // register, AND every /auth/refresh — not just at login. Persisting
    // only the first token would mean the next cold start tries to use one
    // that's already been revoked.
    persistRefreshToken(headerRefreshToken);
  }

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
  // precomputed (optional): { calories, protein, carbs, fat, source } from a
  // prior preview() call — reuses those exact numbers instead of paying for
  // and running a second real AI estimate.
  create: (food, precomputed) => apiFetch("/meals", { method: "POST", body: { food, ...precomputed } }),
  preview: (food) => apiFetch("/meals/preview", { method: "POST", body: { food } }),
  // Same MealPreview shape as preview() above (food/calories/protein/carbs/
  // fat/source) — the caller feeds the response into the exact same
  // review-before-log state either way.
  analyzePhoto: (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return apiFetch("/meals/analyze-photo", { method: "POST", body: formData });
  },
  update: (id, { food }) => apiFetch(`/meals/${id}`, { method: "PATCH", body: { food } }),
  remove: (id) => apiFetch(`/meals/${id}`, { method: "DELETE" }),
};

export const weightApi = {
  list: () => apiFetch("/weight-entries"),
  // loggedDate (optional): "YYYY-MM-DD", matching localDateKey()'s format —
  // omitted, the backend defaults to its own today.
  log: (weightKg, loggedDate) =>
    apiFetch("/weight-entries", {
      method: "POST",
      body: { weight_kg: weightKg, ...(loggedDate ? { logged_date: loggedDate } : {}) },
    }),
  remove: (id) => apiFetch(`/weight-entries/${id}`, { method: "DELETE" }),
};

export { ApiError, apiFetch };
