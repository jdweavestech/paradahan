import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { ReportReason, ReportStatus, SpotReport } from "@/lib/types";

/**
 * Lightweight JSON-file store for user-submitted listing reports. Same
 * stand-in pattern as the other stores in this folder. There's no admin UI
 * wired up to review these yet (see README known limitations) — this
 * closes the loop on the "Report" button itself, i.e. the report is
 * captured and durable, ready for a moderation view to read from later.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf8");
}

function readAll(): SpotReport[] {
  ensureStore();
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as SpotReport[];
  } catch {
    return [];
  }
}

function writeAll(reports: SpotReport[]) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), "utf8");
}

export function createReport(input: {
  spotId: string;
  spotName: string;
  reportedBy: string;
  reportedByName: string;
  reason: ReportReason;
  details: string;
}): SpotReport {
  const reports = readAll();
  const report: SpotReport = {
    ...input,
    id: randomUUID(),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  writeAll(reports);
  return report;
}

export function getAllReports(status?: ReportStatus): SpotReport[] {
  const reports = readAll();
  const filtered = status ? reports.filter((r) => r.status === status) : reports;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
