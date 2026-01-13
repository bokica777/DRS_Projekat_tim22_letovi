import React, { createContext, useContext, useMemo, useState } from "react";
import type { User, Role } from "../types/auth";

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "access_token";
const USER_KEY = "mock_user";

function mockUserForEmail(email: string): User {
  // quick mock: admin ako email sadrži "admin", manager ako sadrži "manager"
  const lower = email.toLowerCase();
  const role: Role = lower.includes("admin")
    ? "ADMIN"
    : lower.includes("manager")
    ? "MANAGER"
    : "USER";

  return {
    id: 1,
    email,
    firstName: role === "ADMIN" ? "Admin" : role === "MANAGER" ? "Manager" : "User",
    lastName: "Demo",
    role,
    balance: 200,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const login = async (email: string, password: string) => {
    // mock validacija
    if (!email.includes("@") || password.length < 4) {
      throw new Error("Neispravan email ili lozinka.");
    }
    // simulacija čekanja
    await new Promise((r) => setTimeout(r, 600));

    const u = mockUserForEmail(email);
    localStorage.setItem(TOKEN_KEY, "mock-jwt-token");
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const hasRole = (roles: Role[]) => !!user && roles.includes(user.role);

  const value = useMemo(() => ({ user, login, logout, hasRole }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
