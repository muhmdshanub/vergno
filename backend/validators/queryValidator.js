const { check, query, body } = require('express-validator');
const mongoose = require('mongoose');
const { titleRegex } = require('../utils/regexUtils.js');

const validateAddQuery = [
    check('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 50 }).withMessage('Title must be at most 50 characters long')
      .matches(titleRegex).withMessage('Title contains invalid characters'),
  
    check('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters long'),
  
    check('topic')
      .notEmpty().withMessage('Topic is required')
      .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid topic ID')
  ];

  const likeQueryValidator = [
    check('queryId')
      .notEmpty().withMessage('Query ID is required')
      .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid query ID format')
  ];

const getAllQueryValidator = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('sortBy').optional().isIn(['latest', 'oldest']).withMessage('Invalid sortBy value'),
    query('filterBy').optional().isIn(['default', 'blocked']).withMessage('Invalid filterBy value'),
  ];

const blockQueryValidator = [
  body('queryId')
    .notEmpty().withMessage('Query ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid query ID format'),
];

const getSingleQueryDetailsValidator = [
  query('queryId')
    .notEmpty().withMessage('Query ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid query ID format'),
];

const getReportsValidator = [
  query('queryId')
    .notEmpty().withMessage('Query ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid query ID format'),
  query('pageNum')
    .optional()
    .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  query('limitNum')
    .optional()
    .isInt({ min: 1 }).withMessage('Limit number must be a positive integer'),
];

const getAllReportsValidator = [
  query('pageNum')
    .optional()
    .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  query('limitNum')
    .optional()
    .isInt({ min: 1 }).withMessage('Limit number must be a positive integer'),
];

module.exports = { 
    
    validateAddQuery,
    likeQueryValidator,
    getAllQueryValidator,
    blockQueryValidator,
    getSingleQueryDetailsValidator,
    getReportsValidator,
    getAllReportsValidator,

};
