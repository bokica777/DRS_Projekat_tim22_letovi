import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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
  const { user, logout, avatarUrl } = useAuth();
  const nav = useNavigate();

  // samo cache-bust za slučaj da se negde koristi URL (fallback)
  const [avatarVersion] = useState(() => Date.now());

  const apiOrigin = useMemo(() => {
    const v = (import.meta as any).env?.VITE_API_URL as string | undefined;
    const fallback = window.location.origin;

    if (!v) return fallback;

    try {
      return new URL(v).origin;
    } catch {
      return fallback;
    }
  }, []);

  // fallback iz user.avatarDataUrl (data:/http(s):/relativno)
  const avatarSrc = useMemo(() => {
    const raw = (user as any)?.avatarDataUrl as string | undefined;

    if (!raw) return "";

    // preview base64
    if (raw.startsWith("data:")) return raw;

    // blob URL (ako negde upadne)
    if (raw.startsWith("blob:")) return raw;

    // već apsolutni URL
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const sep = raw.includes("?") ? "&" : "?";
      return `${raw}${sep}v=${avatarVersion}`;
    }

    // relativno: "/static/..." ili "static/..."
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    const abs = `${apiOrigin}${path}`;
    const sep = abs.includes("?") ? "&" : "?";
    return `${abs}${sep}v=${avatarVersion}`;
  }, [user, apiOrigin, avatarVersion]);

  // ✅ final: prvo avatarUrl (blob iz AuthContext), pa fallback avatarSrc
  const finalAvatarSrc = useMemo(() => {
    return avatarUrl || avatarSrc || "";
  }, [avatarUrl, avatarSrc]);

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
                  <NavItem to="/flights/new" label="Novi let" />
                  <NavItem to="/flights/mine" label="Moji letovi" />
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
                  <div className="h-9 w-9 rounded-2xl overflow-hidden bg-white/15 border border-white/20 grid place-items-center text-white font-semibold">
                    {finalAvatarSrc ? (
                      <img
                        src={finalAvatarSrc}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (user.firstName?.[0]?.toUpperCase() ?? "U")
                    )}
                  </div>

                  <div className="leading-tight text-left">
                    <div className="font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-white/80">
                      {user.role} •{" "}
                      <span className="font-semibold text-white">
                        {user.balance}€
                      </span>
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
                <NavItem to="/flights/new" label="Novi let" />
                <NavItem to="/flights/mine" label="Moji letovi" />
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
