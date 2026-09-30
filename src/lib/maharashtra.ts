/**
 * Single Source of Truth for Maharashtra Administrative Divisions and Districts
 * NIRMAAN - Government Projects Finance Management System (Academic Demo)
 */

export interface DistrictInfo {
  name: string;
  headquarters?: string;
  division: string;
}

export interface DivisionInfo {
  division: string;
  marathiName: string;
  color: string;
  icon: string;
  districts: string[];
}

export const MAHARASHTRA_DIVISIONS: DivisionInfo[] = [
  {
    division: "Konkan",
    marathiName: "कोकण विभाग",
    color: "#000080",
    icon: "water",
    districts: [
      "Mumbai City",
      "Mumbai Suburban",
      "Thane",
      "Palghar",
      "Raigad",
      "Ratnagiri",
      "Sindhudurg",
    ],
  },
  {
    division: "Nashik",
    marathiName: "नाशिक विभाग",
    color: "#319e23",
    icon: "park",
    districts: [
      "Nashik",
      "Dhule",
      "Nandurbar",
      "Jalgaon",
      "Ahmednagar",
    ],
  },
  {
    division: "Pune",
    marathiName: "पुणे विभाग",
    color: "#fe9832",
    icon: "location_city",
    districts: [
      "Pune",
      "Satara",
      "Sangli",
      "Solapur",
      "Kolhapur",
    ],
  },
  {
    division: "Aurangabad (Chhatrapati Sambhajinagar)",
    marathiName: "छत्रपती संभाजीनगर विभाग",
    color: "#6d3a00",
    icon: "fort",
    districts: [
      "Chhatrapati Sambhajinagar",
      "Jalna",
      "Beed",
      "Latur",
      "Osmanabad (Dharashiv)",
      "Nanded",
      "Hingoli",
      "Parbhani",
    ],
  },
  {
    division: "Amravati",
    marathiName: "अमरावती विभाग",
    color: "#ba1a1a",
    icon: "agriculture",
    districts: [
      "Amravati",
      "Akola",
      "Washim",
      "Buldhana",
      "Yavatmal",
    ],
  },
  {
    division: "Nagpur",
    marathiName: "नागपूर विभाग",
    color: "#00003c",
    icon: "account_balance",
    districts: [
      "Nagpur",
      "Wardha",
      "Chandrapur",
      "Gadchiroli",
      "Gondia",
      "Bhandara",
    ],
  },
];

// Single source of truth array containing all 36 Maharashtra districts
export const ALL_DISTRICTS: string[] = MAHARASHTRA_DIVISIONS.flatMap((d) => d.districts);

export const TOTAL_DISTRICTS_COUNT = ALL_DISTRICTS.length; // 36

export function getDivisionForDistrict(districtName: string): DivisionInfo | undefined {
  return MAHARASHTRA_DIVISIONS.find((div) =>
    div.districts.some((d) => d.toLowerCase() === districtName.toLowerCase())
  );
}

export function isMaharashtraDistrict(districtName: string): boolean {
  return ALL_DISTRICTS.some((d) => d.toLowerCase() === districtName.toLowerCase());
}
