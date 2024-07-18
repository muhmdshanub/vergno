// validators/userValidators.js

const { check, validationResult, body, query } = require('express-validator');
const mongoose = require('mongoose');
const { nameRegex,  passwordRegex, dobRegex, otpRegex } = require('../utils/regexUtils.js');

const validateUserProfileUpdate = [
  check('email').isEmail().withMessage('Invalid email format'),
  check('dob').isISO8601().withMessage('Invalid date of birth'),
  check('gender').isIn(['male', 'female', 'other']).withMessage('Gender should be male, female, or other'),
  check('phone').optional().trim().isLength({ min: 10, max: 10 }).withMessage('Phone number should be exactly 10 characters if provided'),
  check('nationality').optional().trim().isLength({ min: 2 }).withMessage('Nationality should have more than one character if provided')
];

const validateUserRegistration = [
  check('name')
    .not().isEmpty().withMessage('Name is required')
    .isLength({ min:3, max: 50 }).withMessage('Name should be less than 50 characters')
    .matches(nameRegex).withMessage('Name should only contain letters and spaces, and spaces should not be at the beginning or end'),
  check('email')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 50 }).withMessage('Email should be less than 50 characters'),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(passwordRegex).withMessage('Password must contain at least one letter, one number, and one special character'),
    // check('dob')
    // .matches(dobRegex).withMessage('Invalid date of birth. Expected format: YYYY-Month-DD'),
  check('gender')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be either "male", "female", or "other"')
];

const validateVerifyEmailOtp = [
  check('email')
  .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email should be less than 100 characters'),
  check('otp')
    .matches(otpRegex).withMessage('Invalid OTP format'),
  check('tempUserId')
    .isMongoId().withMessage('Invalid tempUserId format'),
];


const validateUserLogin = [
  check('email')
  .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email should be less than 100 characters'),
  check('password')
    .matches(passwordRegex).withMessage('Password must be at least 8 characters long and contain at least one letter, one number, and one special character')
];


const validateVerifyOtpForgotPassword = [
  check('email')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email should be less than 100 characters'),
  check('otp')
    .matches(otpRegex).withMessage('Invalid OTP format'),
];


const validatePasswordUpdate = [
  check('oldPassword').not().isEmpty().withMessage('Old password is required'),
  check('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

const validateResetForgotPassword = [
  check('email')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email should be less than 100 characters'),
  check('newPassword')
    .matches(passwordRegex).withMessage('Password must be at least 8 characters long and contain at least one letter, one number, and one special character'),
];


const validateForgotPassword = [
  check('email')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 100 }).withMessage('Email should be less than 100 characters'),
];

const validateFirebaseAuth = [
  // Normalize and validate email_verified
  body('user.email_verified')
    .custom(value => {
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) return true;
      throw new Error('Email verification status must be a boolean or a string representing a boolean');
    })
    .toBoolean().withMessage('Email verification status must be a boolean'),
  check('user.email').isEmail().withMessage('Invalid email format'),
  check('user.sub').optional().isString().withMessage('Google ID (sub) must be a string'),
  check('user.user_id').optional().isString().withMessage('User ID must be a string'),
  check('user.uid').optional().isString().withMessage('UID must be a string'),
  check('user.name').optional().isString().withMessage('Name must be a string'),
  check('user.picture').optional().isString().withMessage('Profile picture URL must be a string')
];

const validateGetAllUsersInfoforAdmin = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer'),
  query('sortBy')
    .optional()
    .isIn(['name', 'oldest', 'latest','default'])
    .withMessage('Invalid sortBy value'),
  query('searchBy')
    .optional()
    .isString()
    .withMessage('Search term must be a string'),
  query('filterBy')
    .optional()
    .isIn(['default', 'blocked'])
    .withMessage('Invalid filterBy value')
];

const validateBlockUser = [
  check('userId')
    .trim()
    .escape()
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid user ID')
];

const validateUnblockUser = [
  check('userId')
    .trim()
    .escape()
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid user ID')
];

const validateUpdateUserName = [
  check('newName')
    .trim()
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
    .matches(nameRegex).withMessage('Name should only contain letters and spaces'),
];

const validateGetOtherUserProfileData = [
  check('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format')
];

const validateGetOtherUserAboutInfo = [
  check('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format')
];

const validateDiscoverEnable = [
  body('isDiscoverEnabled')
    .isBoolean()
    .withMessage('isDiscoverEnabled must be a boolean')
]

module.exports = {
  validateUserProfileUpdate,
  validateUserRegistration,
  validatePasswordUpdate,
  validateVerifyEmailOtp,
  validateUserLogin,
  validateVerifyOtpForgotPassword,
  validateForgotPassword,
  validateResetForgotPassword,
  validateFirebaseAuth,
  validateGetAllUsersInfoforAdmin,
  validateBlockUser,
  validateUnblockUser,
  validateUpdateUserName,
  validateGetOtherUserProfileData,
  validateGetOtherUserAboutInfo,
  validateDiscoverEnable,
  
};
