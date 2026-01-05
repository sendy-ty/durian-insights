import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = localStorage.getItem("duriancount_user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
