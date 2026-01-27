import React, { createContext, useContext, useMemo, useState } from "react";
import type { User, Role } from "../types/auth";
import { apiLogin } from "../api/auth";

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

function mapBackendUserToFrontend(u: {
  id: number;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
}): User {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.first_name,
    lastName: u.last_name,

    dateOfBirth: "",
    gender: "OSTALO",
    country: "",
    street: "",
    streetNumber: "",

    balance: 0,
    avatarDataUrl: undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);

    localStorage.setItem(TOKEN_KEY, res.token);

    const mapped = mapBackendUserToFrontend(res.user);
    localStorage.setItem(USER_KEY, JSON.stringify(mapped));

    setUser(mapped);
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
