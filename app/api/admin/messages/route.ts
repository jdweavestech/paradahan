import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/session";
import { getAllContactMessages } from "@/lib/server/contactStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const param = req.nextUrl.searchParams.get("status");
  const status = param === "new" || param === "handled" ? param : undefined;
  return NextResponse.json({ messages: await getAllContactMessages(status) });
}
