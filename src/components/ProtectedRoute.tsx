import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useCurrentUser();

  // While checking auth status, show a centered spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If /auth/me returned 401 or failed, redirect to landing page
  if (isError || !user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
