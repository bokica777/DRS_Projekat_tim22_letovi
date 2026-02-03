import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";

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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      {/* Card */}
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT: Image/Brand panel */}
          <div className="relative hidden md:block">
            {/* Pozadina “aviokompanija vibe” */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800" />

            <img
              src="/src/assets/login.png"
              className="absolute inset-0 h-full w-full object-cover"
              alt="DRS Fly"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-700/80 via-blue-800/75 to-indigo-900/80" />


            <div className="relative z-10 p-10 h-full flex flex-col justify-between text-white">
              <div>
                <div className="text-xs tracking-widest uppercase opacity-90">
                  DRS Fly
                </div>
                <h1 className="mt-3 text-4xl font-extrabold leading-tight">
                  DOBRO DOŠLI
                </h1>
                <p className="mt-3 text-white/90 max-w-sm">
                  Vaš let, vaš ritam. Prijavite se i upravljajte kartama, letovima
                  i profilom — sve na jednom mestu.
                </p>
              </div>

              <div className="text-sm text-white/80">
                ✈️ „Letimo pametno, letimo zajedno.”
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="p-6 sm:p-10">
            <div className="md:hidden mb-6">
              <div className="text-xs tracking-widest uppercase text-gray-500">
                DRS Fly
              </div>
              <h1 className="mt-2 text-3xl font-extrabold">DOBRO DOŠLI</h1>
              <p className="mt-2 text-sm text-gray-600">
                Prijavite se da nastavite.
              </p>
            </div>

            <h2 className="text-xl font-semibold">Prijava</h2>
            <p className="mt-1 text-sm text-gray-600">
              Unesite email i lozinku.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  placeholder="npr. admin@test.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <Label>Lozinka</Label>
                <Input
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              <Button
                variant="primary"
                disabled={loading}
                className="w-full rounded-xl py-2.5"
                type="submit"
              >
                {loading ? "Prijava…" : "Prijavi se"}
              </Button>
            </form>

            <div className="mt-5 text-sm text-gray-600">
              Nemaš nalog?{" "}
              <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/register">
                Registruj se
              </Link>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              Tip: koristi <b>admin@test.com</b>, <b>manager@test.com</b> ili <b>user@test.com</b> (seed).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
