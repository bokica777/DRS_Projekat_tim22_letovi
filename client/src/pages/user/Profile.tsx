import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { Gender, User } from "../../types/auth";
import { updateUser } from "../../mocks/usersStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!user) return <div style={{ padding: 16 }}>Nisi ulogovan.</div>;

  const [form, setForm] = useState<User>({ ...user });

  const set = <K extends keyof User>(k: K, v: User[K]) => setForm((p) => ({ ...p, [k]: v }));

  const onAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("avatarDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    await updateUser(form);
    setSaving(false);
    alert("Sačuvano ✅");
    window.location.reload(); // brzo za mock
  };

  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    width: "100%",
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h2>Moj profil</h2>

      <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12 }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, overflow: "hidden", border: "1px solid #eee" }}>
          {form.avatarDataUrl ? (
            <img src={form.avatarDataUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#999" }}>
              ?
            </div>
          )}
        </div>

        <div>
          <label>Slika profila</label>
          <input type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0])} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label>Ime</label>
            <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Prezime</label>
            <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label>Email</label>
            <input value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Datum rođenja</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label>Pol</label>
            <select value={form.gender as Gender} onChange={(e) => set("gender", e.target.value as any)} style={inputStyle}>
              <option value="M">M</option>
              <option value="F">Ž</option>
              <option value="OTHER">Drugo</option>
            </select>
          </div>
          <div>
            <label>Država</label>
            <input value={form.country} onChange={(e) => set("country", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <div>
            <label>Ulica</label>
            <input value={form.street} onChange={(e) => set("street", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Broj</label>
            <input value={form.streetNumber} onChange={(e) => set("streetNumber", e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <label>Stanje na računu (€)</label>
          <input type="number" value={form.balance} onChange={(e) => set("balance", Number(e.target.value) as any)} style={inputStyle} />
        </div>

        <button disabled={saving} onClick={save} style={{ ...inputStyle, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Čuvam..." : "Sačuvaj"}
        </button>
      </div>
    </div>
  );
}
