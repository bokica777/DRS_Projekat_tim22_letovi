import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../mocks/usersStore";
import type { Gender } from "../../types/auth";

export default function RegisterPage() {
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // mock validacija

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender>("OTHER");
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!firstName.trim() || !lastName.trim()) return setErr("Ime i prezime su obavezni.");
    if (!email.includes("@")) return setErr("Email nije validan.");
    if (password.length < 4) return setErr("Lozinka mora imati bar 4 karaktera.");
    if (!dateOfBirth) return setErr("Datum rođenja je obavezan.");
    if (!country.trim()) return setErr("Država je obavezna.");
    if (!street.trim()) return setErr("Ulica je obavezna.");
    if (!streetNumber.trim()) return setErr("Broj ulice je obavezan.");

    await registerUser({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      country: country.trim(),
      street: street.trim(),
      streetNumber: streetNumber.trim(),
      balance: 0, // po specifikaciji postoji, ali realno default 0
    });

    nav("/login");
  };

  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    width: "100%",
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2>Registracija</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label>Ime</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Prezime</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Lozinka</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label>Datum rođenja</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Pol</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as any)} style={inputStyle}>
              <option value="M">M</option>
              <option value="F">Ž</option>
              <option value="OTHER">Drugo</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label>Država</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Ulica</label>
            <input value={street} onChange={(e) => setStreet(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label>Broj</label>
            <input value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <button style={{ ...inputStyle, cursor: "pointer" }}>Kreiraj nalog</button>
      </form>

      <div style={{ marginTop: 12, color: "#555" }}>
        Već imaš nalog? <Link to="/login">Prijavi se</Link>
      </div>
    </div>
  );
}
