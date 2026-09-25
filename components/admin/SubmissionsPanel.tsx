"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import SubmissionCard from "./SubmissionCard";
import { FilterTabs, PanelState } from "./PanelParts";
import type { ParkingSubmission, SubmissionStatus } from "@/lib/types";

const filters: { id: SubmissionStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

export default function SubmissionsPanel() {
  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");
  const [submissions, setSubmissions] = useState<ParkingSubmission[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
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

  return (
    <>
      <FilterTabs
        filters={filters}
        active={filter}
        onChange={setFilter}
        counts={submissions !== null ? counts : undefined}
      />
      <div className="mt-6 space-y-4">
        <PanelState
          loading={submissions === null}
          error={fetchError}
          empty={submissions !== null && submissions.length === 0}
          icon={ShieldCheck}
          emptyText={`No ${filter === "all" ? "" : filter} submissions right now.`}
        />
        {submissions?.map((s) => (
          <SubmissionCard key={s.id} submission={s} onChanged={handleChanged} onRemoved={handleRemoved} />
        ))}
      </div>
    </>
  );
}
