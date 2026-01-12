import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function TopUpPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(50);

  if (!user) return <div style={{ padding: 16 }}>Nisi ulogovan.</div>;

  const addMoney = () => {
    if (amount <= 0) return alert("Iznos mora biti veći od 0.");
    // mock: samo povećamo localStorage user
    const next = { ...user, balance: user.balance + amount };
    localStorage.setItem("mock_user", JSON.stringify(next));
    window.location.reload(); // najbrže (kasnije ćemo lepše)
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h2>Uplata na račun</h2>

      <div style={{ marginTop: 10, color: "#555" }}>
        Trenutno stanje: <b>{user.balance} €</b>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", flex: 1 }}
        />
        <button
          onClick={addMoney}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
        >
          Uplati
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
        (Mock) Kasnije ovo ide na <code>POST /api/users/me/topup</code>
      </div>
    </div>
  );
}
