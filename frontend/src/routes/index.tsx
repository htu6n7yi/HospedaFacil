import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Hoteis from "@/pages/Hoteis";
import Hospedes from "@/pages/Hospedes";
import Reservas from "@/pages/Reservas";
import NotFound from "@/pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/" element={<Login />} />

        {/* Rotas protegidas — todas dentro do AppLayout */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hoteis"    element={<Hoteis />} />
          <Route path="/hospedes"  element={<Hospedes />} />
          <Route path="/reservas"  element={<Reservas />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}