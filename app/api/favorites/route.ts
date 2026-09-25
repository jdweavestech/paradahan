import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { addFavorite, getFavoritesByUser, removeFavorite } from "@/lib/server/favoritesStore";
import { getPublicSpotById } from "@/lib/server/parkingStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const favorites = await getFavoritesByUser(user.id);
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

  if (!(await getPublicSpotById(spotId))) {
    return NextResponse.json({ error: "That parking spot couldn't be found." }, { status: 404 });
  }

  await addFavorite(user.id, spotId);
  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const spotId = req.nextUrl.searchParams.get("spotId");
  if (!spotId) {
    return NextResponse.json({ error: "spotId is required." }, { status: 400 });
  }

  await removeFavorite(user.id, spotId);
  return NextResponse.json({ saved: false });
}
