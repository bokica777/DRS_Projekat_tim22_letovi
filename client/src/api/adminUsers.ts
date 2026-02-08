import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Role, User } from "../types/auth";

export type UserDto = {
  id: number;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  street_number?: string | number;
  role?: Role;
  email?: string;
  gender?: any;
  country?: string;
  street?: string;

  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  streetNumber?: string | number;
};

function mapUserDto(d: UserDto): User {
  return {
    id: d.id,
    firstName: d.firstName ?? d.first_name ?? "",
    lastName: d.lastName ?? d.last_name ?? "",
    email: d.email ?? "",
    dateOfBirth: d.dateOfBirth ?? d.date_of_birth ?? "",
    gender: d.gender,
    country: d.country ?? "",
    street: d.street ?? "",
    streetNumber: String(d.streetNumber ?? d.street_number ?? ""),
    role: (d.role ?? "KORISNIK") as Role,
  } as User;
}

export async function fetchAdminUsers(): Promise<User[]> {
  const res = await http.get(endpoints.admin.users);
  const data = res.data as UserDto[];
  return data.map(mapUserDto);
}

export async function adminChangeUserRole(userId: number, role: Role): Promise<void> {
  await http.patch(endpoints.admin.userRole(userId), { role });
}

export async function adminDeleteUser(userId: number): Promise<void> {
  await http.delete(endpoints.admin.userById(userId));
}
