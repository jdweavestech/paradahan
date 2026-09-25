import type { ReportReason, ReportStatus, SpotReport } from "@/lib/types";
import { supabase, unwrap, unwrapOne } from "./supabase";

/** User-submitted listing reports, backed by the `reports` table in Supabase. */

interface ReportRow {
  id: string;
  spot_id: string;
  spot_name: string;
  reported_by: string | null;
  reported_by_name: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

function fromRow(row: ReportRow): SpotReport {
  return {
    id: row.id,
    spotId: row.spot_id,
    spotName: row.spot_name,
    reportedBy: row.reported_by ?? "",
    reportedByName: row.reported_by_name,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
    resolvedBy: row.resolved_by ?? undefined,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createReport(input: {
  spotId: string;
  spotName: string;
  reportedBy: string;
  reportedByName: string;
  reason: ReportReason;
  details: string;
}): Promise<SpotReport> {
  const row = unwrapOne(
    await supabase()
      .from("reports")
      .insert({
        spot_id: input.spotId,
        spot_name: input.spotName,
        reported_by: input.reportedBy,
        reported_by_name: input.reportedByName,
        reason: input.reason,
        details: input.details,
      })
      .select("*")
      .single<ReportRow>(),
    "createReport"
  );
  return fromRow(row);
}

export async function getAllReports(status?: ReportStatus): Promise<SpotReport[]> {
  let query = supabase().from("reports").select("*");
  if (status) query = query.eq("status", status);
  const rows = unwrap(
    await query.order("created_at", { ascending: false }).returns<ReportRow[]>(),
    "getAllReports"
  );
  return (rows ?? []).map(fromRow);
}

/** Admin action: mark a report resolved, or reopen it. */
export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  resolvedBy: string
): Promise<SpotReport | null> {
  if (!UUID_RE.test(id)) return null;
  const resolved = status === "resolved";
  const row = unwrap(
    await supabase()
      .from("reports")
      .update({
        status,
        resolved_at: resolved ? new Date().toISOString() : null,
        resolved_by: resolved ? resolvedBy : null,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle<ReportRow>(),
    "updateReportStatus"
  );
  return row ? fromRow(row) : null;
}
