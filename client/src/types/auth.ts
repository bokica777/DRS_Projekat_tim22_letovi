export type Role = "KORISNIK" | "MENADZER" | "ADMIN"

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  balance: number;
};
