// validation.js

// Validation for id: Must be a positive integer
function validateId(id) {
    return Number.isInteger(id) && id > 0;
  }
  
  // Validation for name: Must be a non-empty string with only alphabetic characters
  function validateName(name) {
    const nameRegex = /^[A-Za-z]+$/;
    return name && nameRegex.test(name.trim());
  }
  
  // Validation for email: Must be a valid email format
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email.trim());
  }
  
  // Validation for marks and feepaid: Must be numeric values
  function validateNumeric(value) {
    return !isNaN(value);
  }

  function isValidDateFormat(dateString) {
    // Regular expression to match the format "YYYY-MM-DD"
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateFormatRegex.test(dateString);
  }

  function validateGrade(grade) {
    const validGrades = ['A', 'B', 'C', 'D'];
    return validGrades.includes(grade);
  }
  
  module.exports = {
    validateId,
    validateName,
    validateEmail,
    validateNumeric,
    isValidDateFormat,
    validateGrade,
  };
  