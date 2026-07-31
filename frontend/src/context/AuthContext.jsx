import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, clearInMemoryAuth, setSessionExpiredHandler } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // api.js calls this when a refresh attempt itself fails — the session is
  // genuinely over (not just one request), so react globally: drop back to
  // the login screen with a clear reason, instead of a raw error left
  // wherever the triggering request happened to be made.
  //
  // Only show the message if there was actually a logged-in user at the
  // time — the very first /auth/me check on mount also goes through this
  // same retry-then-fail path, and for a never-logged-in visitor (or a
  // fresh cold start with no in-memory tokens left to restore) that 401 is
  // completely normal, not an expired session. Re-registered on every
  // `user` change so the closure always checks the current value.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      if (user) {
        setSessionMessage("Your session expired. Please sign in again.");
      }
      setUser(null);
    });
    return () => setSessionExpiredHandler(null);
  }, [user]);

  const login = useCallback(async (email, password) => {
    setSessionMessage("");
    const loggedInUser = await authApi.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (email, password, name) => {
    setSessionMessage("");
    const newUser = await authApi.register(email, password, name);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      clearInMemoryAuth();
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updatedUser = await authApi.updateMe(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, sessionMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
