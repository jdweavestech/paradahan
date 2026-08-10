"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { ReportReason } from "@/lib/types";

const REPORT_REASONS: ReportReason[] = [
  "Incorrect information",
  "Permanently closed",
  "Inappropriate content",
  "Duplicate listing",
  "Other",
];

export default function ReportSpotPanel({
  spotId,
  onClose,
}: {
  spotId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId, reason, details }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: "Something went wrong." });
        return;
      }
      setDone(true);
    } catch {
      setErrors({ form: "Network error — please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card-surface mt-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Report this listing</h3>
          <p className="mt-1 text-xs text-muted">
            Let us know what&apos;s wrong and a moderator will take a look.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close report form"
          className="text-ink/40 transition-colors hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      {done ? (
        <p className="mt-4 text-sm font-medium text-success">
          Thanks — your report has been submitted for review.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <label className="text-sm font-semibold text-ink">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="input-base mt-1.5 text-sm"
            >
              <option value="">Select a reason…</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-xs font-medium text-danger">{errors.reason}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-ink">
              Details {reason !== "Other" && <span className="font-normal text-muted">(optional)</span>}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Anything else moderators should know?"
              className="input-base mt-1.5 text-sm"
            />
            {errors.details && (
              <p className="mt-1 text-xs font-medium text-danger">{errors.details}</p>
            )}
          </div>

          {errors.form && <p className="mt-3 text-xs font-medium text-danger">{errors.form}</p>}

          <div className="mt-4 flex gap-2">
            <button
              onClick={submit}
              disabled={submitting || !reason}
              className="btn-primary !py-2.5 !px-5 text-xs disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit Report
            </button>
            <button
              onClick={onClose}
              disabled={submitting}
              className="btn-ghost !py-2.5 !px-5 text-xs"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
