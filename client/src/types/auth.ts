export type Role = "USER" | "MANAGER" | "ADMIN";
export type Gender = "M" | "F" | "OTHER";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;

  dateOfBirth: string; // ISO ili YYYY-MM-DD
  gender: Gender;
  country: string;
  street: string;
  streetNumber: string;

  balance: number;
  avatarDataUrl?: string; // base64 slika (mock)
};
