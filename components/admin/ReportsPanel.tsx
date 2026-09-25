"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flag, Check, RotateCcw, Loader2, ExternalLink } from "lucide-react";
import { FilterTabs, PanelState } from "./PanelParts";
import type { ReportStatus, SpotReport } from "@/lib/types";

const filters: { id: ReportStatus | "all"; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

export default function ReportsPanel() {
  const [filter, setFilter] = useState<ReportStatus | "all">("open");
  const [reports, setReports] = useState<SpotReport[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReports(null);
    setFetchError(null);

    const query = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/reports${query}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load reports.");
        return data;
      })
      .then((data) => {
        if (!cancelled) setReports(data.reports ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setReports([]);
          setFetchError(err.message ?? "Failed to load reports.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { open: 0, resolved: 0 };
    for (const r of reports ?? []) c[r.status]++;
    return c;
  }, [reports]);

  async function setStatus(report: SpotReport, status: ReportStatus) {
    setBusyId(report.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong.");
        return;
      }
      const updated: SpotReport = data.report;
      setReports((prev) => {
        if (!prev) return prev;
        if (filter !== "all" && updated.status !== filter) return prev.filter((r) => r.id !== updated.id);
        return prev.map((r) => (r.id === updated.id ? updated : r));
      });
    } catch {
      setActionError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <FilterTabs filters={filters} active={filter} onChange={setFilter} counts={reports !== null ? counts : undefined} />
      {actionError && (
        <p className="mt-4 rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{actionError}</p>
      )}
      <div className="mt-6 space-y-4">
        <PanelState
          loading={reports === null}
          error={fetchError}
          empty={reports !== null && reports.length === 0}
          icon={Flag}
          emptyText={`No ${filter === "all" ? "" : filter} reports right now.`}
        />
        {reports?.map((r) => (
          <div key={r.id} className="card-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/parking/${r.spotId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-primary"
                >
                  {r.spotName}
                  <ExternalLink size={13} />
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  Reported by <span className="font-semibold text-ink/70">{r.reportedByName}</span> on{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  r.status === "open" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}
              >
                {r.status === "open" ? "Open" : "Resolved"}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-ink">{r.reason}</p>
            {r.details && <p className="mt-1 whitespace-pre-line text-sm text-ink/70">{r.details}</p>}

            {r.resolvedBy && (
              <p className="mt-2 text-xs text-muted">
                Resolved by {r.resolvedBy}
                {r.resolvedAt && ` on ${new Date(r.resolvedAt).toLocaleDateString()}`}
              </p>
            )}

            <div className="mt-3">
              {r.status === "open" ? (
                <button
                  onClick={() => setStatus(r, "resolved")}
                  disabled={busyId !== null}
                  className="btn-primary !bg-success !py-2.5 !shadow-none disabled:opacity-60"
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Mark Resolved
                </button>
              ) : (
                <button
                  onClick={() => setStatus(r, "open")}
                  disabled={busyId !== null}
                  className="btn-secondary !py-2.5 disabled:opacity-60"
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  Reopen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
