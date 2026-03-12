import { Navigate } from "react-router-dom";
import authService from "@/services/authService";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}