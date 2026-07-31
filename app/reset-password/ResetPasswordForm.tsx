"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or has expired. Request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.token ?? data.errors?.password ?? "Something went wrong.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center bg-background py-16">
      <Container className="flex justify-center">
        <Reveal className="w-full max-w-md">
          <div className="card-surface p-8 sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
                <KeyRound size={20} />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
                Set a new password
              </h1>
              <p className="mt-2 text-sm text-muted">
                Choose a new password for your account.
              </p>
            </div>

            {!token ? (
              <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-center text-sm font-medium text-danger">
                This reset link is invalid or has expired.{" "}
                <Link href="/forgot-password" className="underline underline-offset-2">
                  Request a new one
                </Link>
                .
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-5 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-ink"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="input-base pr-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-ink"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      className="input-base"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? "Saving..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
