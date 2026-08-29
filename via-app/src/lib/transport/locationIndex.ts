/**
 * Offline-first location search index for Dhaka.
 * ~24 known locations with area tags. No network calls required.
 */

export interface KnownLocation {
  name: string;
  area: string;
  lat: number;
  lon: number;
}

export const DHAKA_LOCATIONS: KnownLocation[] = [
  { name: "Uttara Sector 7", area: "Uttara", lat: 23.8759, lon: 90.3795 },
  { name: "Hazrat Shahjalal Airport", area: "Airport", lat: 23.8433, lon: 90.3978 },
  { name: "Bashundhara R/A", area: "Bashundhara", lat: 23.8183, lon: 90.4356 },
  { name: "Baridhara", area: "Baridhara", lat: 23.8067, lon: 90.4234 },
  { name: "Gulshan 1", area: "Gulshan", lat: 23.7925, lon: 90.4078 },
  { name: "Banani", area: "Banani", lat: 23.7903, lon: 90.4001 },
  { name: "Badda", area: "Badda", lat: 23.7856, lon: 90.4234 },
  { name: "Rampura", area: "Rampura", lat: 23.7689, lon: 90.4212 },
  { name: "Khilgaon", area: "Khilgaon", lat: 23.7543, lon: 90.4356 },
  { name: "Malibagh", area: "Malibagh", lat: 23.7489, lon: 90.4178 },
  { name: "Moghbazar", area: "Moghbazar", lat: 23.7456, lon: 90.4134 },
  { name: "Farmgate", area: "Farmgate", lat: 23.7512, lon: 90.3945 },
  { name: "Tejgaon", area: "Tejgaon", lat: 23.7589, lon: 90.3878 },
  { name: "Shahbag", area: "Shahbag", lat: 23.7389, lon: 90.3945 },
  { name: "New Market", area: "New Market", lat: 23.7345, lon: 90.3856 },
  { name: "Dhanmondi 27", area: "Dhanmondi", lat: 23.7461, lon: 90.3763 },
  { name: "Kalabagan", area: "Kalabagan", lat: 23.7523, lon: 90.3712 },
  { name: "Mohammadpur", area: "Mohammadpur", lat: 23.7589, lon: 90.3567 },
  { name: "Adabor", area: "Adabor", lat: 23.7678, lon: 90.3512 },
  { name: "Mirpur 10", area: "Mirpur", lat: 23.8023, lon: 90.3567 },
  { name: "Motijheel", area: "Motijheel", lat: 23.7289, lon: 90.4167 },
  { name: "Saydabad", area: "Saydabad", lat: 23.7189, lon: 90.4321 },
  { name: "Jatrabari", area: "Jatrabari", lat: 23.7089, lon: 90.4456 },
  { name: "Kamalapur", area: "Kamalapur", lat: 23.7234, lon: 90.4267 },
];

export function searchLocations(query: string, limit = 6): KnownLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DHAKA_LOCATIONS.filter(
    (loc) => loc.name.toLowerCase().includes(q) || loc.area.toLowerCase().includes(q),
  ).slice(0, limit);
}