import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { FavoriteRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "favorites.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "[]", "utf8");
}

function readAll(): FavoriteRecord[] {
  ensureStore();
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as FavoriteRecord[];
  } catch {
    return [];
  }
}

function writeAll(favorites: FavoriteRecord[]) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(favorites, null, 2), "utf8");
}

export function getFavoritesByUser(userId: string): FavoriteRecord[] {
  return readAll()
    .filter((f) => f.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function isFavorite(userId: string, spotId: string): boolean {
  return readAll().some((f) => f.userId === userId && f.spotId === spotId);
}

export function addFavorite(userId: string, spotId: string): FavoriteRecord {
  const favorites = readAll();
  const existing = favorites.find((f) => f.userId === userId && f.spotId === spotId);
  if (existing) return existing;

  const record: FavoriteRecord = { userId, spotId, createdAt: new Date().toISOString() };
  favorites.push(record);
  writeAll(favorites);
  return record;
}

export function removeFavorite(userId: string, spotId: string): void {
  const favorites = readAll();
  writeAll(favorites.filter((f) => !(f.userId === userId && f.spotId === spotId)));
}
