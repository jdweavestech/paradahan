"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPinPlus, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { ParkingSubmission } from "@/lib/types";

const statusStyles: Record<ParkingSubmission["status"], { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending Review", className: "bg-warning/10 text-warning", icon: Clock },
  approved: { label: "Approved", className: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-danger/10 text-danger", icon: XCircle },
};

export default function MyContributions() {
  const [submissions, setSubmissions] = useState<ParkingSubmission[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/parking?mine=true")
      .then((res) => (res.ok ? res.json() : { submissions: [] }))
      .then((data) => {
        if (!cancelled) setSubmissions(data.submissions ?? []);
      })
      .catch(() => {
        if (!cancelled) setSubmissions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (submissions === null) {
    return (
      <div className="flex items-center justify-center py-16 text-muted">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center">
        <MapPinPlus size={28} className="mx-auto text-muted" />
        <p className="mt-3 text-sm font-semibold text-ink">No contributions yet</p>
        <p className="mt-1 text-sm text-muted">
          Submitted parking spots you add will show up here.
        </p>
        <Link href="/add-parking" className="btn-primary mt-5 inline-flex">
          Add a Parking Spot
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => {
        const status = statusStyles[sub.status];
        return (
          <div key={sub.id} className="card-surface flex gap-4 p-5">
            {sub.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sub.photos[0]}
                alt={sub.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary-light/50 text-primary">
                <MapPinPlus size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-sm font-bold text-ink">{sub.name}</h3>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                >
                  <status.icon size={12} />
                  {status.label}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted">{sub.address}</p>
              <p className="mt-2 text-xs text-muted">
                Submitted {new Date(sub.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
