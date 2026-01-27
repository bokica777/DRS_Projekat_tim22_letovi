import { http } from "./https";
import { endpoints } from "./endpoints";

export type Role = "KORISNIK" | "MENADZER" | "ADMIN";

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    role: Role;
    first_name: string;
    last_name: string;
  };
};

export async function apiLogin(email: string, password: string) {
  const { data } = await http.post<LoginResponse>(endpoints.auth.login, { email, password });
  return data;
}

export async function apiMe() {
  const { data } = await http.get(endpoints.auth.me);
  return data;
}

export async function apiLogout() {
  const { data } = await http.post(endpoints.auth.logout);
  return data;
}
