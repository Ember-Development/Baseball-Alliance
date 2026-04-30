import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken as setApiToken } from "../lib/api";

export type User = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // hydrate from localStorage to avoid UI flicker on first paint
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // On mount, if a token exists, verify it with /auth/me
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    try {
      const me = await api.me();
      setUser(me);
      localStorage.setItem("user", JSON.stringify(me));
    } catch {
      // token invalid or request failed — clear state to be safe
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const logout = () => {
    setApiToken(null);
    localStorage.removeItem("user");
    // if you store anything else related to auth, clear it here
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({ user, loading, refresh, setUser, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
