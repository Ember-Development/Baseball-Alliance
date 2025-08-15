import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function useMe() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .me()
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);
  return { me, loading };
}
