import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Gender } from "../types/auth";

export type Role = "KORISNIK" | "MENADZER" | "ADMIN";

export type BackendUser = {
  id: number;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
};

export type LoginResponse = {
  token: string;
  user: BackendUser;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
  country: string;
  street: string;
  number: string;
  balance: number;
};

export async function apiLogin(email: string, password: string) {
  const { data } = await http.post<LoginResponse>(endpoints.auth.login, { email, password });
  return data;
}

export async function apiRegister(payload: RegisterRequest) {
  const { data } = await http.post(endpoints.auth.register, payload);
  return data;
}

export async function apiMe() {
  const { data } = await http.get<BackendUser>(endpoints.auth.me);
  return data;
}

export async function apiLogout() {
  const { data } = await http.post(endpoints.auth.logout);
  return data;
}
