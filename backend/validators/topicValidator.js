const { check, validationResult, body, query } = require('express-validator');
const mongoose = require('mongoose');
const { nameRegex,  passwordRegex, dobRegex, otpRegex } = require('../utils/regexUtils.js');

const validateCreateTopic = [
  check('name')
    .trim()  // Trim whitespace from the beginning and end
    .notEmpty().withMessage('Name is required')
    .matches(nameRegex).withMessage('Name can only contain letters and spaces'),
  check('description')
    .trim()  // Trim whitespace from the beginning and end
    .isLength({ max: 1000 }).withMessage('Description should not exceed 1000 characters')
];


const validateAutofillSuggestions = [
    query('search')
      .notEmpty().withMessage('Search query is required')
      .matches(nameRegex).withMessage('Search query is invalid. Only letters and spaces are allowed')
  ];

  const validateGetAllTopicsForAdmin = [
    query('pageNum')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  
    query('limitNum')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  
    query('sortBy')
      .optional({ nullable: true, checkFalsy: true })
      .isIn(['default', 'oldest', 'latest']).withMessage('SortBy must be one of: default, oldest, latest')
  ];

  const validatesuggestTopics = [
    query('pageNum')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  
    query('limitNum')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ];

  const validateFollowTopic = [
    body('topicId')
      .notEmpty().withMessage('Topic ID is required')
      .isMongoId().withMessage('Invalid Topic ID format')
  ];

  const validateDetailsTopic = [
    query('topicId')
      .notEmpty().withMessage('Topic ID is required')
      .isMongoId().withMessage('Invalid Topic ID format')
  ];

  const validateGetAllQueriesForTopic = [
    check('topicId')
      .isMongoId().withMessage('Invalid topic ID'),
    check('pageNum')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    check('limitNum')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit number must be a positive integer'),
  ];


module.exports = {
  validateCreateTopic,
  validateAutofillSuggestions,
  validateGetAllTopicsForAdmin,
  validatesuggestTopics,
  validateFollowTopic,
  validateGetAllQueriesForTopic,
  validateDetailsTopic,


};
