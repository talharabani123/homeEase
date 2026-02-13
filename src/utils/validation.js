// Pakistan-specific validation utilities

/**
 * Validates Pakistani CNIC number
 * Format: XXXXX-XXXXXXX-X (13 digits with dashes)
 * Example: 35202-1234567-1
 */
export const validateCNIC = (cnic) => {
  const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
  return cnicRegex.test(cnic);
};

/**
 * Formats CNIC number with dashes as user types
 * Input: 3520212345671
 * Output: 35202-1234567-1
 */
export const formatCNIC = (value) => {
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
  const phoneRegex = /^(\+92|0)3[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Formats Pakistani phone number
 * Input: 03001234567 or +923001234567
 * Output: +92 300 1234 567
 */
export const formatPakistaniPhone = (value) => {
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
  return phone.replace(/\s/g, '');
};

/**
 * Validates email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Minimum 6 characters
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
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
  if (!validatePassword(password)) return 'Password must be at least 6 characters';
  return null;
};
