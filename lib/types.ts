export type VehicleType = "Car" | "Motorcycle" | "Bike" | "Van/SUV" | "Truck";

export type ParkingType = "Covered" | "Open-air" | "Multi-level" | "Street";

export interface ParkingSpot {
  id: string;
  name: string;
  city: string;
  address: string;
  image: string;
  lat: number;
  lng: number;
  priceFrom: number;
  priceUnit: "hour" | "entry" | "day";
  hours: string;
  isOpen24h: boolean;
  parkingType: ParkingType;
  rating: number;
  reviewCount: number;
  vehicleTypes: VehicleType[];
  distanceKm?: number;
  amenities: string[];
  /** True for spots that came from an approved community submission rather than the curated seed set. */
  isCommunitySubmitted?: boolean;
  /** ISO date used to sort "recently added" — only set for community submissions. */
  addedAt?: string;
}

/** Status of a community-submitted parking spot, set by moderators. */
export type SubmissionStatus = "pending" | "approved" | "rejected";

/**
 * A parking spot submitted through the "Add a Parking Spot" form.
 * Stored separately from the curated `ParkingSpot` mock data so that
 * moderation (approve/reject) never touches the seed dataset.
 */
export interface ParkingSubmission {
  id: string;
  submittedBy: string; // user id
  submittedByName: string;
  status: SubmissionStatus;
  createdAt: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  parkingType: ParkingType | "";
  vehicleTypes: VehicleType[];
  amenities: string[];
  openingTime: string;
  closingTime: string;
  isOpen24h: boolean;
  rate: number | null;
  rateUnit: "hour" | "entry" | "day";
  photos: string[]; // data URLs (small demo uploads) or hosted image URLs
  reviewedAt?: string;
  reviewedBy?: string; // admin's full name, for a lightweight audit trail
  reviewNote?: string; // e.g. a rejection reason
}

export interface FavoriteRecord {
  userId: string;
  spotId: string;
  createdAt: string;
}

export interface CityInfo {
  id: string;
  name: string;
  region: string;
  parkingCount: number;
  image: string;
}

export interface Review {
  id: string;
  /** ParkingSpot.id this review belongs to. */
  spotId: string;
  /** Author's user id — lets the UI detect "this is my review" for editing. */
  userId: string;
  author: string;
  rating: number;
  /** Human-readable display date, e.g. "August 2026". */
  date: string;
  /** ISO timestamp used for sorting and as the upsert key alongside userId. */
  createdAt: string;
  comment: string;
  vehicleType: VehicleType;
}

/** Reasons a user can cite when flagging a listing for moderator review. */
export type ReportReason =
  | "Incorrect information"
  | "Permanently closed"
  | "Inappropriate content"
  | "Duplicate listing"
  | "Other";

export type ReportStatus = "open" | "resolved";

/** A user-submitted flag on a parking spot listing, for moderator review. */
export interface SpotReport {
  id: string;
  spotId: string;
  spotName: string;
  reportedBy: string; // user id
  reportedByName: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: string;
}
