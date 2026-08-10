import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { addFavorite, getFavoritesByUser, removeFavorite } from "@/lib/server/favoritesStore";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const favorites = getFavoritesByUser(user.id);
  return NextResponse.json({ spotIds: favorites.map((f) => f.spotId) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { spotId } = body as Record<string, unknown>;
  if (typeof spotId !== "string" || !spotId) {
    return NextResponse.json({ error: "spotId is required." }, { status: 400 });
  }

  addFavorite(user.id, spotId);
  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const spotId = req.nextUrl.searchParams.get("spotId");
  if (!spotId) {
    return NextResponse.json({ error: "spotId is required." }, { status: 400 });
  }

  removeFavorite(user.id, spotId);
  return NextResponse.json({ saved: false });
}
