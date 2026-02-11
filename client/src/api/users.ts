import { http } from "./https";
import { endpoints } from "./endpoints";
import type { User } from "../types/auth";

type BackendMe = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: string;
  country: string;
  street: string;
  number: string;
  balance: number;
  role: string;
  profileImage?: string | null;
};

function normalizeBirthDate(s: string): string {
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

function mapMeToUser(me: BackendMe): User {
  return {
    id: me.id,
    email: me.email,
    role: me.role as any,
    firstName: me.firstName,
    lastName: me.lastName,
    dateOfBirth: normalizeBirthDate(me.birthDate),
    gender: me.gender as any,
    country: me.country,
    street: me.street,
    streetNumber: me.number,
    balance: me.balance,
    avatarDataUrl: "",
  };
}

export async function getMe(): Promise<User> {
  const { data } = await http.get<BackendMe>(endpoints.users.me);
  return mapMeToUser(data);
}

export type UpdateMeDto = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  country?: string;
  street?: string;
  number?: string;
  password?: string;
};

export async function updateMe(dto: UpdateMeDto): Promise<User> {
  const { data } = await http.patch<BackendMe>(endpoints.users.updateMe, dto);
  return mapMeToUser(data);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fetchMyProfileImageObjectUrl(): Promise<string> {
  const res = await http.get(endpoints.users.uploadImage, { responseType: "blob" });
  return URL.createObjectURL(res.data);
}

export async function uploadProfileImage(file: File): Promise<User> {
  const fd = new FormData();
  fd.append("file", file);

  await http.post(endpoints.users.uploadImage, fd, {
    headers: { "Content-Type": undefined as any },
  });

  const me = await getMe();
  const dataUrl = await fileToDataUrl(file);

  return { ...me, avatarDataUrl: dataUrl };
}

export async function deposit(amount: number) {
  const { data } = await http.post(endpoints.users.deposit, { amount });
  return data;
}
