const { query, body, check } = require('express-validator');
const {} = require('../utils/regexUtils')
const mongoose = require('mongoose');


const suggestPeoplesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 }).withMessage('Limit number must be a positive integer')
];

const createFollowRequestValidator = [
    body('followed_user_id')
      .exists().withMessage('Followed user ID is required')
      .isMongoId().withMessage('Invalid followed user ID format'),
  ];

const allFollowRequestsValidator = [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ];
const declineFollowRequestValidator = [
    body('following_user_id')
      .exists().withMessage('Following user ID is required')
      .isMongoId().withMessage('Following user ID must be a valid MongoDB ID'),
  ];

  const blockUserValidator = [
    body('blockedUserId')
      .exists().withMessage('Blocked user ID is required')
      .isMongoId().withMessage('Blocked user ID must be a valid MongoDB ID'),
  ];



module.exports = {
    suggestPeoplesValidator,
    createFollowRequestValidator,
    allFollowRequestsValidator,
    declineFollowRequestValidator,
    blockUserValidator,


};
