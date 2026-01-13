import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!firstName || !lastName) return setErr("Ime i prezime su obavezni.");
    if (!email.includes("@")) return setErr("Email nije validan.");
    if (password.length < 4) return setErr("Lozinka mora imati bar 4 karaktera.");

    // mock: u realnosti ide POST /api/auth/register
    nav("/login");
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h2>Registracija</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Ime"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Prezime"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Lozinka"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <button
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          Kreiraj nalog
        </button>
      </form>

      <div style={{ marginTop: 12, color: "#555" }}>
        Već imaš nalog? <Link to="/login">Prijavi se</Link>
      </div>
    </div>
  );
}
