// Pakistan-specific validation utilities

/**
 * Validates Pakistani CNIC number
 * Format: XXXXX-XXXXXXX-X (13 digits with dashes)
 * Example: 35202-1234567-1
 */
export const validateCNIC = (cnic) => {
  if (!cnic) return false;
  const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
  return cnicRegex.test(cnic);
};

/**
 * Formats CNIC number with dashes as user types
 * Input: 3520212345671
 * Output: 35202-1234567-1
 */
export const formatCNIC = (value) => {
  // Safety check
  if (!value) return '';
  
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 13 digits
  const limited = numbers.slice(0, 13);
  
  // Add dashes at appropriate positions
  let formatted = limited;
  if (limited.length > 5) {
    formatted = limited.slice(0, 5) + '-' + limited.slice(5);
  }
  if (limited.length > 12) {
    formatted = limited.slice(0, 5) + '-' + limited.slice(5, 12) + '-' + limited.slice(12);
  }
  
  return formatted;
};

/**
 * Validates Pakistani mobile number
 * Accepts: +923001234567 or 03001234567
 * Format: +92 XXX XXXX XXX
 */
export const validatePakistaniPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(\+92|0)3[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Formats Pakistani phone number
 * Input: 03001234567 or +923001234567
 * Output: +92 300 1234 567
 */
export const formatPakistaniPhone = (value) => {
  // Safety check
  if (!value) return '';
  
  // Remove all non-numeric characters except +
  let numbers = value.replace(/[^\d+]/g, '');
  
  // Convert 0 prefix to +92
  if (numbers.startsWith('0')) {
    numbers = '+92' + numbers.slice(1);
  }
  
  // Ensure it starts with +92
  if (!numbers.startsWith('+92')) {
    if (numbers.startsWith('92')) {
      numbers = '+' + numbers;
    } else if (numbers.startsWith('3')) {
      numbers = '+92' + numbers;
    }
  }
  
  // Limit to correct length (+92 + 10 digits = 13 characters)
  numbers = numbers.slice(0, 13);
  
  // Format: +92 XXX XXXX XXX
  if (numbers.length > 3) {
    let formatted = numbers.slice(0, 3); // +92
    if (numbers.length > 5) {
      formatted += ' ' + numbers.slice(3, 6); // XXX
    } else {
      formatted += ' ' + numbers.slice(3);
    }
    if (numbers.length > 9) {
      formatted += ' ' + numbers.slice(6, 10); // XXXX
    } else if (numbers.length > 6) {
      formatted += ' ' + numbers.slice(6);
    }
    if (numbers.length > 10) {
      formatted += ' ' + numbers.slice(10); // XXX
    }
    return formatted;
  }
  
  return numbers;
};

/**
 * Converts formatted phone to plain format for API
 * Input: +92 300 1234 567
 * Output: +923001234567
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/\s/g, '');
};

/**
 * Validates email format
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (@#$%&*!^)
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@#$%&*!^]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

/**
 * Validates address
 * Requirements:
 * - Minimum 10 characters
 * - Must contain letters and numbers
 * - Cannot be just numbers or just letters
 */
export const validateAddress = (address) => {
  if (!address || address.trim().length < 10) return false;
  
  const hasLetters = /[a-zA-Z]/.test(address);
  const hasNumbers = /[0-9]/.test(address);
  
  // Must have both letters and numbers (house/street number + street name)
  return hasLetters && hasNumbers;
};

/**
 * Get CNIC error message
 */
export const getCNICError = (cnic) => {
  if (!cnic) return 'CNIC number is required';
  if (!validateCNIC(cnic)) return 'Enter valid CNIC in XXXXX-XXXXXXX-X format';
  return null;
};

/**
 * Get phone error message
 */
export const getPhoneError = (phone) => {
  if (!phone) return 'Phone number is required';
  const cleaned = cleanPhoneNumber(phone);
  if (!validatePakistaniPhone(cleaned)) return 'Enter valid Pakistani mobile number';
  return null;
};

/**
 * Get email error message
 */
export const getEmailError = (email) => {
  if (!email) return null; // Email is optional
  if (!validateEmail(email)) return 'Enter valid email address';
  return null;
};

/**
 * Get password error message
 */
export const getPasswordError = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[@#$%&*!^]/.test(password)) return 'Password must contain at least one special character (@#$%&*!^)';
  return null;
};

/**
 * Get address error message
 */
export const getAddressError = (address) => {
  if (!address || !address.trim()) return 'Address is required';
  if (address.trim().length < 10) return 'Address must be at least 10 characters';
  if (!/[a-zA-Z]/.test(address)) return 'Please enter a valid complete address';
  if (!/[0-9]/.test(address)) return 'Address must include house/street number';
  return null;
};
