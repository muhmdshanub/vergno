const { body, query, check } = require('express-validator');
const {passwordRegex } = require('../utils/regexUtils.js');

const authAdminValidator = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 50 }).withMessage('Email exceeds maximum length of 50 characters'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one letter, one number, and one special character')
];

module.exports = {
    authAdminValidator,
};
