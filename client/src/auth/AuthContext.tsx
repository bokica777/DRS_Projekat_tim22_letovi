import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { User, Role } from "../types/auth";
import { apiLogin } from "../api/auth";
import { getMe } from "../api/users";

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  refreshMe: () => Promise<User | null>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const me = await getMe();
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    setUser(me);
    return me;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      await refreshMe();
    },
    [refreshMe]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const hasRole = useCallback((roles: Role[]) => !!user && roles.includes(user.role), [user]);

  const value = useMemo(() => ({ user, login, logout, hasRole, refreshMe }), [user, login, logout, hasRole, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
