import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/flights");
    } catch (ex: any) {
      setErr(ex?.message ?? "Greška pri prijavi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h2>Prijava</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
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
        <Button variant="primary">Test</Button>

      </form>

      <div style={{ marginTop: 12, color: "#555" }}>
        Nemaš nalog? <Link to="/register">Registruj se</Link>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#777" }}>
        Tip: koristi email sa <b>admin</b> ili <b>manager</b> da vidiš role-based UI (mock).
      </div>
    </div>
  );
}
