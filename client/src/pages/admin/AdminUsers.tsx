import { useEffect, useState } from "react";
import type { Role, User } from "../../types/auth";
import { changeRole, deleteUser, listUsers } from "../../mocks/usersStore";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { Label } from "../../components/common/Label";

function roleLabel(role: string) {
  switch (role) {
    case "KORISNIK":
      return "Korisnik";
    case "MENADZER":
      return "Menadžer";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([]);

  const refresh = () => listUsers().then(setItems);

  useEffect(() => {
    refresh();
  }, []);

  const setRole = async (id: number, role: Role) => {
    await changeRole(id, role);
    alert("Uloga promenjena (mock). U pravoj verziji ide i mail.");
    refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("Obrisati korisnika?")) return;
    await deleteUser(id);
    refresh();
  };

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">

        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,.35) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-700/70 via-blue-800/65 to-indigo-900/70" />
          <div className="relative z-10 p-6 sm:p-10 text-white">
            <div className="text-xs tracking-widest uppercase text-white/80">
              DRS Fly • Admin
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Korisnici
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Upravljanje korisnicima: uloge i brisanje (mock).
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="text-sm text-gray-600">
              Ukupno: <b className="text-gray-900">{items.length}</b>
            </div>

            <div className="mt-4 grid gap-3">
              {items.map((u) => (
                <div
                  key={u.id}
                  className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold truncate">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {u.email}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          {u.country}, {u.street} {u.streetNumber} • DOB:{" "}
                          {u.dateOfBirth} • Pol: {u.gender}
                        </div>
                      </div>

                      <div className="shrink-0 w-full lg:w-[260px]">
                        <div className="grid gap-2">
                          <Label>Uloga</Label>
                          <Select
                            value={u.role}
                            onChange={(e) => setRole(u.id, e.target.value as Role)}
                            className="rounded-2xl"
                          >
                            <option value="KORISNIK">Korisnik</option>
                            <option value="MENADZER">Menadžer</option>
                            <option value="ADMIN">Admin</option>
                          </Select>
                          <div className="text-xs text-gray-500">
                            Trenutno: <b className="text-gray-700">{roleLabel(u.role)}</b>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 -translate-x-1/2" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 translate-x-1/2" />
                    <div className="border-t border-dashed border-gray-200" />
                  </div>

                  <div className="p-4 sm:p-5 flex justify-end">
                    <Button
                      variant="danger"
                      className="rounded-2xl"
                      onClick={() => remove(u.id)}
                    >
                      Obriši korisnika
                    </Button>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                  Nema korisnika.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
