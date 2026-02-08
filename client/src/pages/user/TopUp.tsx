import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";
import { deposit } from "../../api/users";



const quick = [20, 50, 100, 200];

export default function TopUpPage() {
  const { user, refreshMe } = useAuth();

  const [amount, setAmount] = useState<number>(50);
  const [saving, setSaving] = useState(false);

  if (!user) return <div className="p-4">Nisi ulogovan.</div>;

  const addMoney = async () => {
    if (amount <= 0) return alert("Iznos mora biti veći od 0.");

    setSaving(true);
    try {
      await deposit(amount);
      await refreshMe();
      alert("Uplata uspešna ✅");
    } finally {
      setSaving(false);
    }
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
              DRS Fly • Uplata
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Uplata na račun
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Dodaj sredstva na svoj nalog i kupuj karte bez čekanja.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="text-sm font-semibold">Brza uplata</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {quick.map((v) => (
                  <Button
                    key={v}
                    variant={amount === v ? "primary" : "secondary"}
                    onClick={() => setAmount(v)}
                    className="rounded-2xl"
                    type="button"
                  >
                    +{v} €
                  </Button>
                ))}
              </div>

              <div className="mt-6 grid gap-2">
                <Label>Unesi iznos</Label>
                <Input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="rounded-2xl"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={addMoney}
                  className="rounded-2xl px-5"
                  disabled={saving}
                >
                  {saving ? "Uplaćujem..." : "Uplati"}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="text-xs text-gray-500">Trenutno stanje</div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight">
                {user.balance} €
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Uplati sredstva da bi mogao da kupuješ karte.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
