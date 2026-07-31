export type VehicleType = "Car" | "Motorcycle" | "Van/SUV" | "Truck";

export type ParkingType = "Covered" | "Open-air" | "Multi-level" | "Street";

export interface ParkingSpot {
  id: string;
  name: string;
  city: string;
  address: string;
  image: string;
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
  author: string;
  rating: number;
  date: string;
  comment: string;
  vehicleType: VehicleType;
}
