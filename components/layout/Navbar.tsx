"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, SquareParking } from "lucide-react";
import Container from "../shared/Container";
import UserMenu from "./UserMenu";
import { useSession } from "@/hooks/useSession";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Search Parking", href: "/search" },
  { label: "Add Parking", href: "/add-parking" },
  { label: "Cities", href: "/cities" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading, refresh } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass shadow-soft"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-18 items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
            <SquareParking size={20} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Paradahan
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5">
            <Globe size={16} />
            EN
          </button>
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-ink/5" />
          ) : user ? (
            <UserMenu user={user} onLoggedOut={refresh} />
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary !px-5 !py-2.5">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-card lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-ink/80 hover:bg-ink/5"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <div className="mt-2 border-t border-border px-4 pt-4">
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {user.fullName
                        .trim()
                        .split(/\s+/)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-1">
                    <Link
                      href="/account?tab=profile"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account?tab=saved"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
                    >
                      My Saved Spots
                    </Link>
                    <Link
                      href="/account?tab=contributions"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
                    >
                      My Contributions
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary-light/40"
                      >
                        Moderation
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      refresh();
                      setOpen(false);
                    }}
                    className="btn-secondary mt-3 w-full !text-danger"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2 px-4">
                  <Link href="/login" className="btn-secondary flex-1">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-primary flex-1">
                    Sign Up
                  </Link>
                </div>
              )}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
