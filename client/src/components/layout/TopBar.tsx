import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../common/Button";
import { Container } from "../common/Container";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "relative inline-flex items-center justify-center",
          "px-3 py-2 rounded-2xl text-sm font-medium transition",
          "border",
          isActive
            ? "bg-white/20 text-white border-white/25 shadow-sm"
            : "bg-white/0 text-white/90 border-transparent hover:bg-white/10 hover:border-white/15",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span className="absolute -bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/80" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30">
      <div className="relative border-b border-white/15">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.35) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="absolute inset-0 bg-black/10 backdrop-blur" />

        <Container className="relative py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/flights"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-white/10 transition"
            >
              <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/20 grid place-items-center text-white shadow-sm">
                ✈
              </div>
              <div className="min-w-0">
                <div className="text-xs tracking-widest uppercase text-white/80">
                  DRS Fly
                </div>
                <div className="text-base font-extrabold tracking-tight text-white">
                  Terminal
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 ml-2">
              <NavItem to="/flights" label="Letovi" />

              {user?.role === "KORISNIK" && (
                <>
                  <NavItem to="/tickets" label="Moje karte" />
                  <NavItem to="/topup" label="Uplata" />
                </>
              )}

              {user?.role === "MENADZER" && (
                <>
                  <NavItem to="/tickets" label="Moje karte" />
                  <NavItem to="/topup" label="Uplata" />
                  <NavItem to="/manager/create" label="Novi let" />
                  <NavItem to="/manager/my-flights" label="Moji letovi" />
                </>
              )}

              {user?.role === "ADMIN" && (
                <>
                  <NavItem to="/admin/pending" label="Na čekanju" />
                  <NavItem to="/admin/users" label="Korisnici" />
                  <NavItem to="/admin/ratings" label="Ocene" />
                  <NavItem to="/admin/reports" label="Izveštaji" />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <button
                  onClick={() => nav("/profile")}
                  className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 transition"
                  type="button"
                  title="Profil"
                >
                  <div className="h-9 w-9 rounded-2xl bg-white/15 border border-white/20 grid place-items-center text-white font-semibold">
                    {user.firstName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="leading-tight text-left">
                    <div className="font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-white/80">
                      {user.role} • <span className="font-semibold text-white">{user.balance}€</span>
                    </div>
                  </div>
                </button>

                <Button
                  variant="ghost"
                  onClick={() => nav("/profile")}
                  className="sm:hidden rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/15"
                >
                  Profil
                </Button>

                <Button
                  variant="ghost"
                  className="rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                >
                  Odjava
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  onClick={() => nav("/login")}
                >
                  Prijava
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-2xl bg-white text-sky-900 border border-white hover:bg-white/90"
                  onClick={() => nav("/register")}
                >
                  Registracija
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>

      {user && (
        <div className="lg:hidden relative border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur" />
          <Container className="relative py-2 flex flex-wrap gap-2">
            <NavItem to="/flights" label="Letovi" />

            {user.role === "KORISNIK" && (
              <>
                <NavItem to="/tickets" label="Moje karte" />
                <NavItem to="/topup" label="Uplata" />
              </>
            )}

            {user.role === "MENADZER" && (
              <>
                <NavItem to="/tickets" label="Moje karte" />
                <NavItem to="/topup" label="Uplata" />
                <NavItem to="/manager/create" label="Novi let" />
                <NavItem to="/manager/my-flights" label="Moji letovi" />
              </>
            )}

            {user.role === "ADMIN" && (
              <>
                <NavItem to="/admin/pending" label="Na čekanju" />
                <NavItem to="/admin/users" label="Korisnici" />
                <NavItem to="/admin/ratings" label="Ocene" />
                <NavItem to="/admin/reports" label="Izveštaji" />
              </>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
