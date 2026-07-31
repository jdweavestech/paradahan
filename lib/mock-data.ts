import { CityInfo, ParkingSpot, Review } from "./types";

export const parkingSpots: ParkingSpot[] = [
  {
    id: "spot-ayala-triangle",
    name: "Ayala Triangle Gardens Parking",
    city: "Makati",
    address: "Paseo de Roxas, Makati City",
    image:
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=1200&auto=format&fit=crop",
    priceFrom: 40,
    priceUnit: "hour",
    hours: "5:00 AM – 12:00 AM",
    isOpen24h: false,
    parkingType: "Open-air",
    rating: 4.7,
    reviewCount: 328,
    vehicleTypes: ["Car", "Motorcycle", "Van/SUV"],
    distanceKm: 0.8,
    amenities: ["CCTV", "Security Guard", "Well-lit", "EV Charging"],
  },
  {
    id: "spot-sm-north",
    name: "SM North EDSA – The Block Basement",
    city: "Quezon City",
    address: "North Ave, Quezon City",
    image:
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=1200&auto=format&fit=crop",
    priceFrom: 30,
    priceUnit: "hour",
    hours: "24 Hours",
    isOpen24h: true,
    parkingType: "Covered",
    rating: 4.4,
    reviewCount: 512,
    vehicleTypes: ["Car", "Motorcycle", "Van/SUV", "Truck"],
    distanceKm: 2.3,
    amenities: ["CCTV", "Covered", "Elevator Access", "Wide Aisles"],
  },
  {
    id: "spot-bgc-mall",
    name: "Bonifacio High Street Central Parking",
    city: "Taguig",
    address: "26th St, Bonifacio Global City, Taguig",
    image:
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200&auto=format&fit=crop",
    priceFrom: 50,
    priceUnit: "hour",
    hours: "6:00 AM – 2:00 AM",
    isOpen24h: false,
    parkingType: "Multi-level",
    rating: 4.8,
    reviewCount: 741,
    vehicleTypes: ["Car", "Van/SUV"],
    distanceKm: 3.1,
    amenities: ["CCTV", "Valet Available", "EV Charging", "Car Wash Nearby"],
  },
  {
    id: "spot-cebu-it-park",
    name: "Cebu IT Park Open Lot",
    city: "Cebu City",
    address: "Cardinal Rosales Ave, Cebu IT Park",
    image:
      "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=1200&auto=format&fit=crop",
    priceFrom: 25,
    priceUnit: "hour",
    hours: "24 Hours",
    isOpen24h: true,
    parkingType: "Open-air",
    rating: 4.3,
    reviewCount: 189,
    vehicleTypes: ["Car", "Motorcycle"],
    distanceKm: 5.6,
    amenities: ["Security Guard", "Well-lit"],
  },
  {
    id: "spot-davao-abreeza",
    name: "Abreeza Mall Covered Deck",
    city: "Davao City",
    address: "J.P. Laurel Ave, Davao City",
    image:
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=1200&auto=format&fit=crop",
    priceFrom: 20,
    priceUnit: "hour",
    hours: "9:00 AM – 10:00 PM",
    isOpen24h: false,
    parkingType: "Covered",
    rating: 4.6,
    reviewCount: 264,
    vehicleTypes: ["Car", "Motorcycle", "Van/SUV"],
    distanceKm: 1.4,
    amenities: ["CCTV", "Covered", "Family Restroom Nearby"],
  },
  {
    id: "spot-naia-t3",
    name: "NAIA Terminal 3 Long-Term Lot",
    city: "Pasay",
    address: "NAIA Terminal 3, Pasay City",
    image:
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200&auto=format&fit=crop",
    priceFrom: 60,
    priceUnit: "day",
    hours: "24 Hours",
    isOpen24h: true,
    parkingType: "Multi-level",
    rating: 4.1,
    reviewCount: 903,
    vehicleTypes: ["Car", "Van/SUV", "Truck"],
    distanceKm: 8.9,
    amenities: ["CCTV", "Security Guard", "Shuttle Service"],
  },
];

export const cities: CityInfo[] = [
  {
    id: "makati",
    name: "Makati",
    region: "Metro Manila",
    parkingCount: 214,
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "quezon-city",
    name: "Quezon City",
    region: "Metro Manila",
    parkingCount: 187,
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "taguig",
    name: "Taguig (BGC)",
    region: "Metro Manila",
    parkingCount: 156,
    image:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cebu-city",
    name: "Cebu City",
    region: "Central Visayas",
    parkingCount: 98,
    image:
      "https://images.unsplash.com/photo-1591017713237-5a06e5be09c9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "davao-city",
    name: "Davao City",
    region: "Davao Region",
    parkingCount: 76,
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "pasay",
    name: "Pasay",
    region: "Metro Manila",
    parkingCount: 64,
    image:
      "https://images.unsplash.com/photo-1470004914212-05527e49370b?q=80&w=1200&auto=format&fit=crop",
  },
];

export const reviews: Review[] = [
  {
    id: "rev-1",
    author: "Marco D.",
    rating: 5,
    date: "March 2026",
    comment:
      "Super convenient and the guards are attentive. Found a spot easily even during a weekday rush.",
    vehicleType: "Car",
  },
  {
    id: "rev-2",
    author: "Ellaine T.",
    rating: 4,
    date: "February 2026",
    comment:
      "Rates are fair and clearly posted. Could use better signage near the entrance ramp.",
    vehicleType: "Van/SUV",
  },
  {
    id: "rev-3",
    author: "Jhun P.",
    rating: 5,
    date: "January 2026",
    comment:
      "Motorcycle bay is spacious and shaded. I always come back here when I'm in the area.",
    vehicleType: "Motorcycle",
  },
];

export const popularSearches = [
  "Malls",
  "Hospitals",
  "Universities",
  "Airports",
  "Hotels",
  "Business Districts",
];
