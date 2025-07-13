// src/utils/tierConverter.js (Recommended location)
// or src/services/tierConverter.js

/**
 * Converts a numeric star tier to its human-readable string representation.
 * @param {number} tier - The numeric tier (e.g., 1, 2, 3).
 * @returns {string} The tier string (e.g., "S+", "S", "A").
 */
export function convertTierToString(tier) {
  switch (tier) {
    case 1:
      return "S+";
    case 2:
      return "S";
    case 3:
      return "A";
    case 4:
      return "B";
    case 5:
      return "C";
    default:
      return "NA";
  }
}

export function convertTierToStyle(tier) {
  switch (tier) {
    case 1:
      return "border-yellow-400 text-yellow-200 outline-2 outline-yellow-500 outline-offset-4 m-y-1"; // S+
    case 2:
      return "border-purple-400 text-purple-200"; // S
    case 3:
      return "border-red-500 text-red-200"; // A
    case 4:
      return "border-blue-500 text-blue-200"; // B
    case 5:
      return "border-green-500 text-green-200"; // C
    default:
      return ""; // NA
  }
}
