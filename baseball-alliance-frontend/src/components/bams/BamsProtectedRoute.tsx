import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function hasBamsAccess(roles: string[] | undefined): boolean {
  return Boolean(
    roles?.includes("MEMBER") || roles?.includes("ADMIN")
  );
}

export default function BamsProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-24 text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user || !hasBamsAccess(user.roles)) {
    return <Navigate to="/bams/login" replace />;
  }

  return children;
}
