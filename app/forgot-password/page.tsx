"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { KeyRound, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; resetUrl?: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.email ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
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
            <Link
              href="/login"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
            >
              <ArrowLeft size={15} />
              Back to log in
            </Link>

            {!result ? (
              <>
                <div className="mb-8 flex flex-col items-center text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
                    <KeyRound size={20} />
                  </span>
                  <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
                    Forgot your password?
                  </h1>
                  <p className="mt-2 text-sm text-muted">
                    Enter the email on your account and we&apos;ll email you a reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      className="input-base"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                  <CheckCircle2 size={22} />
                </span>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-muted">{result.message}</p>

                {result.resetUrl && (
                  <div className="mt-6 rounded-2xl border border-warning/20 bg-warning/5 p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-warning">
                      Dev mode — email isn&apos;t configured locally
                    </p>
                    <p className="mt-1.5 text-xs text-muted">
                      RESEND_API_KEY isn&apos;t set, so here&apos;s the reset link directly.
                      In production it&apos;s only ever sent by email.
                    </p>
                    <Link
                      href={result.resetUrl}
                      className="mt-3 block break-all rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                    >
                      {result.resetUrl}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
