"use client";

import { useState } from "react";
import {
  MapPinPlus,
  Check,
  X,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ParkingSubmission, SubmissionStatus } from "@/lib/types";

const statusStyles: Record<SubmissionStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending Review", className: "bg-warning/10 text-warning", icon: Clock },
  approved: { label: "Approved", className: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-danger/10 text-danger", icon: XCircle },
};

export default function SubmissionCard({
  submission,
  onChanged,
  onRemoved,
}: {
  submission: ParkingSubmission;
  onChanged: (updated: ParkingSubmission) => void;
  onRemoved: (id: string) => void;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | "delete" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const status = statusStyles[submission.status];

  async function review(status: "approved" | "rejected", note?: string) {
    setBusy(status === "approved" ? "approve" : "reject");
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onChanged(data.submission);
      setRejecting(false);
      setReviewNote("");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm(`Permanently delete "${submission.name}"? This can't be undone.`)) return;
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onRemoved(submission.id);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card-surface p-5">
      <div className="flex gap-4">
        {submission.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={submission.photos[0]}
            alt={submission.name}
            className="h-20 w-20 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary-light/50 text-primary">
            <MapPinPlus size={22} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-ink">{submission.name}</h3>
              <p className="truncate text-xs text-muted">{submission.address}</p>
            </div>
            <span
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
            >
              <status.icon size={12} />
              {status.label}
            </span>
          </div>

          <p className="mt-2 text-xs text-muted">
            Submitted by <span className="font-semibold text-ink/70">{submission.submittedByName}</span>{" "}
            on {new Date(submission.createdAt).toLocaleDateString()}
          </p>

          {submission.description && (
            <p className="mt-2 line-clamp-2 text-sm text-ink/70">{submission.description}</p>
          )}

          {(submission.vehicleTypes.length > 0 || submission.amenities.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {submission.vehicleTypes.map((v) => (
                <span key={v} className="rounded-full bg-primary-light/50 px-2.5 py-1 text-xs font-medium text-primary-hover">
                  {v}
                </span>
              ))}
              {submission.amenities.map((a) => (
                <span key={a} className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/70">
                  {a}
                </span>
              ))}
            </div>
          )}

          {submission.reviewedBy && (
            <p className="mt-2 text-xs text-muted">
              Reviewed by {submission.reviewedBy}
              {submission.reviewedAt && ` on ${new Date(submission.reviewedAt).toLocaleDateString()}`}
              {submission.reviewNote && ` — "${submission.reviewNote}"`}
            </p>
          )}

          {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}

          {rejecting ? (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Reason for rejecting (optional)"
                className="input-base text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => review("rejected", reviewNote.trim() || undefined)}
                  disabled={busy !== null}
                  className="btn-primary !bg-danger !shadow-none disabled:opacity-60"
                >
                  {busy === "reject" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  Confirm Reject
                </button>
                <button
                  onClick={() => {
                    setRejecting(false);
                    setReviewNote("");
                  }}
                  disabled={busy !== null}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {submission.status !== "approved" && (
                <button
                  onClick={() => review("approved")}
                  disabled={busy !== null}
                  className="btn-primary !bg-success !shadow-none disabled:opacity-60"
                >
                  {busy === "approve" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Approve
                </button>
              )}
              {submission.status !== "rejected" && (
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy !== null}
                  className="btn-secondary disabled:opacity-60"
                >
                  <X size={14} />
                  Reject
                </button>
              )}
              <button
                onClick={remove}
                disabled={busy !== null}
                className="btn-ghost !text-danger disabled:opacity-60"
              >
                {busy === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
