import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-sm text-black/60">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
