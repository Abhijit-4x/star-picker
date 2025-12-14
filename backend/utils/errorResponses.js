/**
 * Standardized validation error response
 * @param {string|string[]} messages - Single message or array of messages
 * @returns {Object} - Formatted error object for 400 response
 */
function validationError(messages) {
  const messageArray = Array.isArray(messages) ? messages : [messages];
  return {
    error: "Validation failed",
    details: messageArray.map((msg) => ({
      message: msg,
    })),
  };
}

/**
 * Single validation error message
 * @param {string} message - Error message
 * @returns {Object} - Formatted error object
 */
function validationErrorSingle(message) {
  return validationError([message]);
}

module.exports = {
  validationError,
  validationErrorSingle,
};
