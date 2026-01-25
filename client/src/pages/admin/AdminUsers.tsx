import { useEffect, useState } from "react";
import type { Role, User } from "../../types/auth";
import { changeRole, deleteUser, listUsers } from "../../mocks/usersStore";

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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Korisnici (ADMIN)</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((u) => (
          <div key={u.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  {u.firstName} {u.lastName} • {u.email}
                </div>
                <div style={{ color: "#666", fontSize: 12 }}>
                  {u.country}, {u.street} {u.streetNumber} • DOB: {u.dateOfBirth} • Pol: {u.gender}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#666" }}>Uloga</div>
                <select value={u.role} onChange={(e) => setRole(u.id, e.target.value as Role)}>
                  <option value="USER">USER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                onClick={() => remove(u.id)}
                style={{ border: "1px solid #ddd", borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: "crimson" }}
              >
                Obriši
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
