"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserCog, Heart, MapPinPlus, ShieldCheck } from "lucide-react";
import type { SessionUser } from "@/hooks/useSession";

const menuLinks = [
  { label: "My Account", href: "/account?tab=profile", icon: UserCog },
  { label: "My Saved Spots", href: "/account?tab=saved", icon: Heart },
  { label: "My Contributions", href: "/account?tab=contributions", icon: MapPinPlus },
];

export default function UserMenu({
  user,
  onLoggedOut,
}: {
  user: SessionUser;
  onLoggedOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials =
    user.fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onLoggedOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {initials}
        </span>
        <span className="max-w-[9rem] truncate">{user.fullName.split(" ")[0]}</span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="card-surface absolute right-0 top-[calc(100%+0.5rem)] w-56 origin-top-right !rounded-2xl p-2 shadow-card"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="mt-1 border-b border-border pb-1">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                role="menuitem"
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/80 transition-colors hover:bg-ink/5"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
            {user.isAdmin && (
              <Link
                role="menuitem"
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary-light/40"
              >
                <ShieldCheck size={16} />
                Moderation
              </Link>
            )}
          </div>
          <button
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      )}
    </div>
  );
}
