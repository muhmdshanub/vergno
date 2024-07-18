const { body, query, check } = require('express-validator');
const mongoose = require('mongoose');
const {passwordRegex } = require('../utils/regexUtils.js');

const getAllPostsValidator = [
    query('postType').isIn(['all_posts', 'queries', 'perspectives']).withMessage('Invalid postType specified'),
    query('postSource').optional().isIn(['from_all', 'from_groups', 'from_users', 'from_topics']).withMessage('Invalid postSource specified'),
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number, must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit, must be between 1 and 100')
  ];


  const removeReportValidator = [
    body('reportPost_Id')
      .exists().withMessage('Post ID is required')
      .isMongoId().withMessage('Invalid Post ID format'),
  ];

  const getAllQueriesForProfileValidator = [
    query('pageNum')
      .optional()
      .isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
  
    query('limitNum')
      .optional()
      .isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),
  ];

  const getAllQueriesForOtherUserValidator = [
    query('userId')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('userId must be a valid ObjectId'),
    
    query('pageNum')
      .optional()
      .isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
  
    query('limitNum')
      .optional()
      .isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),

  ]

module.exports = {
    getAllPostsValidator,
    removeReportValidator,
    getAllQueriesForProfileValidator,
    getAllQueriesForOtherUserValidator,
}