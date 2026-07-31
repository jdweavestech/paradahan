"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

/**
 * Reads the current session user from /api/auth/me. Refetches whenever the
 * pathname changes (e.g. after a redirect from /login or /signup), since
 * this is a client component and won't otherwise know the session cookie
 * changed. Call `refresh()` directly after an in-place action like logout.
 */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return { user, loading, refresh };
}
