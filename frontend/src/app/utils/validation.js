/**
 * Password validation rules that match backend requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
};

/**
 * Validate email domain (must be Gmail or Microsoft)
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email domain is allowed
 */
export function validateEmailDomain(email) {
  const lower = (email || "").toLowerCase();
  return (
    /@gmail\.com$/.test(lower) ||
    /@(outlook|hotmail|live|microsoft)\.com$/.test(lower)
  );
}

/**
 * Validate password against all requirements
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    );
  }

  if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateUsername(username) {
  const errors = [];

  if (!username || username.length < 3 || username.length > 30) {
    errors.push("Username must be between 3 and 30 characters");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push(
      "Username can only contain letters, numbers, underscores, and hyphens"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateEmail(email) {
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all signup fields
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateSignupForm(username, email, password) {
  const errors = [];

  // Validate username
  const usernameValidation = validateUsername(username);
  errors.push(...usernameValidation.errors);

  // Validate email
  const emailValidation = validateEmail(email);
  errors.push(...emailValidation.errors);

  // Validate password
  const passwordValidation = validatePassword(password);
  errors.push(...passwordValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
