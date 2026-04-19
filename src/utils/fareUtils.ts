/**
 * Fare calculation logic based on Odisha State Road Transport Corporation (OSRTC) 
 * fare structure for Bhubaneswar and Odisha region cities.
 */

interface FareRange {
  maxKm: number;
  fare: number;
}

const NON_AC_FARE_TABLE: FareRange[] = [
  { maxKm: 4, fare: 5 },
  { maxKm: 8, fare: 10 },
  { maxKm: 12, fare: 15 },
  { maxKm: 17, fare: 20 },
  { maxKm: 22, fare: 25 },
  { maxKm: 27, fare: 30 },
  { maxKm: 33, fare: 35 },
  { maxKm: 39, fare: 40 },
  { maxKm: 45, fare: 45 },
  { maxKm: 51, fare: 50 },
  { maxKm: 57, fare: 55 },
  { maxKm: 63, fare: 60 },
  { maxKm: 69, fare: 65 },
  { maxKm: 75, fare: 70 },
  { maxKm: 81, fare: 75 },
  { maxKm: 87, fare: 80 },
  { maxKm: 93, fare: 85 },
  { maxKm: 99, fare: 90 },
  { maxKm: 105, fare: 95 },
  { maxKm: 111, fare: 100 },
  { maxKm: 117, fare: 105 },
  { maxKm: 123, fare: 110 },
  { maxKm: 129, fare: 115 },
  { maxKm: 135, fare: 120 },
  { maxKm: 141, fare: 125 },
];

const AC_FARE_TABLE: FareRange[] = [
  { maxKm: 2, fare: 5 },
  { maxKm: 4, fare: 10 },
  { maxKm: 7, fare: 15 },
  { maxKm: 10, fare: 20 },
  { maxKm: 14, fare: 25 },
  { maxKm: 18, fare: 30 },
  { maxKm: 22, fare: 35 },
  { maxKm: 27, fare: 40 },
  { maxKm: 32, fare: 45 },
  { maxKm: 37, fare: 50 },
  { maxKm: 43, fare: 55 },
  { maxKm: 49, fare: 60 },
  { maxKm: 55, fare: 65 },
  { maxKm: 61, fare: 70 },
  { maxKm: 67, fare: 75 },
  { maxKm: 73, fare: 80 },
  { maxKm: 79, fare: 85 },
  { maxKm: 85, fare: 90 },
  { maxKm: 91, fare: 95 },
  { maxKm: 97, fare: 100 },
  { maxKm: 103, fare: 105 },
  { maxKm: 109, fare: 110 },
  { maxKm: 115, fare: 115 },
  { maxKm: 121, fare: 120 },
  { maxKm: 127, fare: 125 },
  { maxKm: 133, fare: 130 },
];

/**
 * Calculates the bus fare based on distance and bus type.
 * @param distanceKm The distance of the journey in kilometers.
 * @param isAC Whether the bus is an AC bus.
 * @returns The calculated fare in INR.
 */
export const calculateOdishaFare = (distanceKm: number, isAC: boolean): number => {
  const table = isAC ? AC_FARE_TABLE : NON_AC_FARE_TABLE;
  
  // Find the first range where maxKm is greater than or equal to the distance
  const range = table.find(r => distanceKm <= r.maxKm);
  
  if (range) {
    return range.fare;
  }
  
  // If distance is beyond the table, use the pattern:
  // After the last entry, each increment of 6km adds 5 Rs.
  const lastEntry = table[table.length - 1];
  const extraKm = distanceKm - lastEntry.maxKm;
  const extraFareCycles = Math.ceil(extraKm / 6);
  return lastEntry.fare + (extraFareCycles * 5);
};

/**
 * Checks if a city or route is in Odisha/Bhubaneswar region to apply specific pricing.
 */
export const isOdishaRegion = (locationName: string): boolean => {
  const odishaCities = [
    'bhubaneswar', 'puri', 'cuttack', 'berhampur', 'sambalpur', 
    'rourkela', 'balasore', 'bhadrak', 'jajpur', 'khordha', 
    'odisha', 'osrtc', 'ama bus'
  ];
  const lowerName = locationName.toLowerCase();
  return odishaCities.some(city => lowerName.includes(city));
};
