import type { Role, User } from "../types/auth";

const USERS_KEY = "mock_users";
const USER_KEY = "mock_user";

function loadUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function ensureSeedUsers() {
  const users = loadUsers();
  if (users.length > 0) return;

  const seed: User[] = [
    {
      id: 1,
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "Demo",
      role: "ADMIN",
      dateOfBirth: "1990-01-01",
      gender: "OTHER",
      country: "Serbia",
      street: "Bulevar",
      streetNumber: "1",
      balance: 0,
    },
    {
      id: 2,
      email: "manager@test.com",
      firstName: "Manager",
      lastName: "Demo",
      role: "MANAGER",
      dateOfBirth: "1995-01-01",
      gender: "OTHER",
      country: "Serbia",
      street: "Nemanjina",
      streetNumber: "2",
      balance: 0,
    },
    {
      id: 3,
      email: "user@test.com",
      firstName: "User",
      lastName: "Demo",
      role: "USER",
      dateOfBirth: "2000-01-01",
      gender: "OTHER",
      country: "Serbia",
      street: "Knez Mihailova",
      streetNumber: "3",
      balance: 200,
    },
  ];

  saveUsers(seed);
}

export function listUsers(): Promise<User[]> {
  return Promise.resolve(loadUsers().sort((a, b) => a.id - b.id));
}

export function registerUser(newUser: Omit<User, "id" | "role">): Promise<User> {
  const users = loadUsers();
  const id = Math.max(0, ...users.map((u) => u.id)) + 1;

  const created: User = {
    ...newUser,
    id,
    role: "USER",
  };

  saveUsers([...users, created]);
  return Promise.resolve(created);
}

export function updateUser(updated: User): Promise<User> {
  const users = loadUsers().map((u) => (u.id === updated.id ? updated : u));
  saveUsers(users);

  // ako je to trenutno ulogovan user, update i njega
  const rawMe = localStorage.getItem(USER_KEY);
  if (rawMe) {
    const me = JSON.parse(rawMe) as User;
    if (me.id === updated.id) localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }
  return Promise.resolve(updated);
}

export function deleteUser(id: number): Promise<void> {
  const users = loadUsers().filter((u) => u.id !== id);
  saveUsers(users);
  return Promise.resolve();
}

export function changeRole(id: number, role: Role): Promise<void> {
  const users = loadUsers().map((u) => (u.id === id ? { ...u, role } : u));
  saveUsers(users);
  return Promise.resolve();
}
