export type Role = "KORISNIK" | "MENADZER" | "ADMIN";

export type Gender = "M" | "Z" | "OSTALO";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;

  dateOfBirth: string;
  gender: Gender;
  country: string;
  street: string;
  streetNumber: string;

  balance: number;
  avatarDataUrl?: string; 
};
