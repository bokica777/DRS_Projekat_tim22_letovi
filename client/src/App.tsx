import { Navigate, Route, Routes } from "react-router-dom";
import FlightsPage from "./pages/user/Flights";
import LoginPage from "./pages/public/Login";
import RegisterPage from "./pages/public/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import MyTicketsPage from "./pages/user/MyTickets";
import AdminRatingsPage from "./pages/admin/AdminRatings";
import AdminPendingFlights from "./pages/admin/AdminPendingFlights";
import ManagerCreateFlightPage from "./pages/manager/ManagerCreateFlight";
import TopUpPage from "./pages/user/TopUp";
import ManagerMyFlightsPage from "./pages/manager/ManagerMyFlights";
import ManagerEditFlightPage from "./pages/manager/ManagerEditFlight";
import AdminReportsPage from "./pages/admin/AdminReports";
import AdminUsersPage from "./pages/admin/AdminUsers";
import ProfilePage from "./pages/user/Profile";

import TopBar from "./components/layout/TopBar";
import { useAuth } from "./auth/AuthContext";
import NotFound from "./pages/public/Notfound";

export default function App() {
  const { user } = useAuth();
  return (
    <div>
      {user && <TopBar />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
            <ProtectedRoute roles={["KORISNIK", "MENADZER"]}>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/topup"
          element={
            <ProtectedRoute roles={["KORISNIK", "MENADZER"]}>
              <TopUpPage />
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
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminReportsPage />
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

        <Route
          path="/flights/new"
          element={
            <ProtectedRoute roles={["MENADZER"]}>
              <ManagerCreateFlightPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flights/mine"
          element={
            <ProtectedRoute roles={["MENADZER"]}>
              <ManagerMyFlightsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flights/:id/edit"
          element={
            <ProtectedRoute roles={["MENADZER"]}>
              <ManagerEditFlightPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
