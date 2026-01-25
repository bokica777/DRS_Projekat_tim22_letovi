import { Link, Route, Routes } from "react-router-dom";
import FlightsPage from "./pages/user/Flights";
import LoginPage from "./pages/public/Login";
import RegisterPage from "./pages/public/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import MyTicketsPage from "./pages/MyTickets";
import AdminRatingsPage from "./pages/AdminRatings";
import AdminPendingFlights from "./pages/AdminPendingFlights";
import ManagerCreateFlightPage from "./pages/ManagerCreateFlight";
import TopUpPage from "./pages/TopUp";
import ManagerMyFlightsPage from "./pages/ManagerMyFlights";
import ManagerEditFlightPage from "./pages/ManagerEditFlight";
import AdminReportsPage from "./pages/AdminReports";
import WSTest from "./pages/WSTest";
import AdminUsersPage from "./pages/admin/AdminUsers";
import ProfilePage from "./pages/user/Profile";

function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        borderBottom: "1px solid #eee",
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/flights">Letovi</Link>
        <Link to="/tickets">Moje karte</Link>
        <Link to="/topup">Uplata</Link>
        {user?.role === "ADMIN" && <Link to="/admin/ratings">Ocene</Link>}
        {user?.role === "ADMIN" && <Link to="/admin/pending">Na čekanju</Link>}
        {user?.role === "MENADZER" && <Link to="/manager/flights/new">Novi let</Link>}
        {user?.role === "MENADZER" && <Link to="/manager/flights">Moji letovi</Link>}
        {user?.role === "ADMIN" && <Link to="/admin/reports">Izveštaji</Link>}
        {user && <Link to="/profile">Profil</Link>}
        {user?.role === "ADMIN" && <Link to="/admin/users">Korisnici</Link>}

      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ color: "#555" }}>
              {user.firstName} ({user.role}) • <b>{user.balance}€</b>
            </span>

            <button
              onClick={logout}
              style={{ border: "1px solid #ddd", borderRadius: 10, padding: "6px 10px", cursor: "pointer" }}
            >
              Odjava
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Prijava</Link>
            <Link to="/register">Registracija</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <TopBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/flights"
          element={
            <ProtectedRoute>
              <FlightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ratings"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminRatingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminPendingFlights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/flights/new"
          element={
            <ProtectedRoute roles={["MENADZER"]}>
              <ManagerCreateFlightPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topup"
          element={
            <ProtectedRoute>
              <TopUpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/flights"
          element={
            <ProtectedRoute roles={["MENADZER"]}>
              <ManagerMyFlightsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/flights/:id/edit"
          element={
            <ProtectedRoute roles={["MENADZER"]}>
              <ManagerEditFlightPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<LoginPage />} />
        <Route path="/ws-test" element={<WSTest />} />
      </Routes>
    </div>
  );
}
