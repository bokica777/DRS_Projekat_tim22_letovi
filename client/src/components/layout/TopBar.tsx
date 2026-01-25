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
          "text-sm px-2 py-1 rounded-lg transition",
          isActive ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-50",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <Container className="py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/flights" className="font-semibold text-lg tracking-tight">
            ✈ Letovi
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavItem to="/flights" label="Letovi" />

            {user?.role === "USER" && (
              <>
                <NavItem to="/tickets" label="Moje karte" />
                <NavItem to="/topup" label="Uplata" />
              </>
            )}

            {user?.role === "MANAGER" && (
              <>
                <NavItem to="/manager/create" label="Novi let" />
                <NavItem to="/manager/my-flights" label="Moji letovi" />
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <NavItem to="/admin/pending" label="Pending" />
                <NavItem to="/admin/users" label="Korisnici" />
                <NavItem to="/admin/ratings" label="Ocene" />
                <NavItem to="/admin/reports" label="Izveštaji" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:block text-sm text-gray-700 hover:underline">
                {user.firstName} {user.lastName}
                <span className="text-gray-400"> • </span>
                <span className="text-gray-600">{user.role}</span>
                <span className="text-gray-500"> • </span>
                <span className="font-semibold">{user.balance}€</span>
              </Link>

              <Button variant="ghost" onClick={() => nav("/profile")} className="sm:hidden">
                Profil
              </Button>

              <Button
                variant="secondary"
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
              <Button variant="secondary" onClick={() => nav("/login")}>
                Prijava
              </Button>
              <Button variant="primary" onClick={() => nav("/register")}>
                Registracija
              </Button>
            </>
          )}
        </div>
      </Container>

      {/* Mobile nav */}
      {user && (
        <div className="md:hidden border-t bg-white">
          <Container className="py-2 flex flex-wrap gap-2">
            <NavItem to="/flights" label="Letovi" />

            {user.role === "USER" && (
              <>
                <NavItem to="/tickets" label="Moje karte" />
                <NavItem to="/topup" label="Uplata" />
              </>
            )}

            {user.role === "MANAGER" && (
              <>
                <NavItem to="/manager/create" label="Novi let" />
                <NavItem to="/manager/my-flights" label="Moji letovi" />
              </>
            )}

            {user.role === "ADMIN" && (
              <>
                <NavItem to="/admin/pending" label="Pending" />
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
