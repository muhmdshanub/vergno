const { body, query, check } = require('express-validator');
const {titleRegex} = require('../utils/regexUtils')
const mongoose = require('mongoose');

const addPerspectiveValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 50 }).withMessage('Title cannot exceed 50 characters')
    .matches(titleRegex).withMessage('Title contains invalid characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('topic')
    .notEmpty().withMessage('Topic is required')
    .isMongoId().withMessage('Invalid topic ID')
];

const likePerspectiveValidator = [
    body('perspectiveId')
      .notEmpty().withMessage('Perspective ID is required')
      .isMongoId().withMessage('Invalid perspective ID')
  ];


  const getAllPerspectiveDetailsForAdminValidator = [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('sortBy')
      .optional()
      .isIn(['latest', 'oldest']).withMessage('Invalid sortBy value'),
    query('filterBy')
      .optional()
      .isIn(['default', 'blocked']).withMessage('Invalid filterBy value'),
  ];

  const blockPerspectiveFromAdminValidator = [
    body('perspectiveId')
      .isMongoId().withMessage('Invalid perspective ID'),
  ];
const getSinglePerspectiveDetailsForAdminValidator = [
  query('perspectiveId')
    .isMongoId().withMessage('Invalid perspective ID'),
];

const getAllReportsForSinglePerspectiveAdminValidator = [
    query('perspectiveId')
      .isMongoId().withMessage('Invalid perspective ID'),
    query('pageNum')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limitNum')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit number must be a positive integer')
  ];

  const getAllReportsForAllPerspectivesAdminValidator = [
    query('pageNum')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limitNum')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit number must be a positive integer')
  ];

module.exports ={
    addPerspectiveValidator,
    likePerspectiveValidator,
    getAllPerspectiveDetailsForAdminValidator,
    blockPerspectiveFromAdminValidator,
    getSinglePerspectiveDetailsForAdminValidator,
    getAllReportsForSinglePerspectiveAdminValidator,
    getAllReportsForAllPerspectivesAdminValidator,
    

} ;
