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
