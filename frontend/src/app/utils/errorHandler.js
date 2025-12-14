/**
 * Extracts error message from API response
 * Handles both simple error messages and detailed validation errors
 * @param {Object} response - The API response object
 * @returns {string} - Formatted error message
 */
export function getErrorMessage(response) {
  // If response has details array with validation errors
  if (
    response.details &&
    Array.isArray(response.details) &&
    response.details.length > 0
  ) {
    return response.details.map((d) => d.message).join("\n");
  }
  // Fall back to simple error message
  return response.error || response.message || "An error occurred";
}
