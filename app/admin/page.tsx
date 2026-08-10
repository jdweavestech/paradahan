"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ShieldAlert } from "lucide-react";
import Container from "@/components/shared/Container";
import { useSession } from "@/hooks/useSession";
import SubmissionCard from "@/components/admin/SubmissionCard";
import type { ParkingSubmission, SubmissionStatus } from "@/lib/types";

const filters: { id: SubmissionStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

export default function AdminPage() {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();

  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");
  const [submissions, setSubmissions] = useState<ParkingSubmission[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !user) router.replace("/login?next=/admin");
  }, [sessionLoading, user, router]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    let cancelled = false;
    setSubmissions(null);
    setFetchError(null);

    const query = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/admin/submissions${query}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load submissions.");
        return data;
      })
      .then((data) => {
        if (!cancelled) setSubmissions(data.submissions ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setSubmissions([]);
          setFetchError(err.message ?? "Failed to load submissions.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.isAdmin, filter]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    for (const s of submissions ?? []) c[s.status]++;
    return c;
  }, [submissions]);

  function handleChanged(updated: ParkingSubmission) {
    setSubmissions((prev) => {
      if (!prev) return prev;
      // If we're viewing a specific status tab, an approve/reject moves the
      // item out of view; otherwise just update it in place.
      if (filter !== "all" && updated.status !== filter) {
        return prev.filter((s) => s.id !== updated.id);
      }
      return prev.map((s) => (s.id === updated.id ? updated : s));
    });
  }

  function handleRemoved(id: string) {
    setSubmissions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
  }

  if (sessionLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="bg-background py-16">
        <Container className="max-w-lg text-center">
          <div className="card-surface p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <ShieldAlert size={24} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
              Not authorized
            </h1>
            <p className="mt-2 text-sm text-muted">
              Your account doesn't have access to the moderation panel.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-background py-16">
      <Container className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Moderation</h1>
            <p className="text-sm text-muted">Review community-submitted parking spots.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.id
                  ? "bg-primary text-white shadow-soft"
                  : "border border-border text-ink/70 hover:bg-ink/5"
              }`}
            >
              {f.label}
              {f.id !== "all" && submissions !== null && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    filter === f.id ? "bg-white/20" : "bg-ink/5"
                  }`}
                >
                  {counts[f.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {submissions === null && (
            <div className="flex items-center justify-center py-16 text-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}

          {fetchError && (
            <p className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{fetchError}</p>
          )}

          {submissions !== null && submissions.length === 0 && !fetchError && (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center">
              <ShieldCheck size={28} className="mx-auto text-muted" />
              <p className="mt-3 text-sm font-semibold text-ink">Nothing here</p>
              <p className="mt-1 text-sm text-muted">
                No {filter === "all" ? "" : filter} submissions right now.
              </p>
            </div>
          )}

          {submissions?.map((s) => (
            <SubmissionCard key={s.id} submission={s} onChanged={handleChanged} onRemoved={handleRemoved} />
          ))}
        </div>
      </Container>
    </div>
  );
}
