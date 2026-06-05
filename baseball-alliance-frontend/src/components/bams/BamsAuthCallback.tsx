import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, setToken } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function BamsAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing sign-in token");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { token: jwt, user } = await api.verifyMagicLink(token);
        if (cancelled) return;
        setToken(jwt);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        navigate("/bams", { replace: true });
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Sign-in failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-sm">
        {error ? (
          <>
            <p className="text-red-700 font-medium">{error}</p>
            <Link
              to="/bams/login"
              className="mt-4 inline-block text-sm font-semibold text-[#163968] hover:underline"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <p className="text-slate-600">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
