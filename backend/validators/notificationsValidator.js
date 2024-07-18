const { query, body, check } = require('express-validator');
const {} = require('../utils/regexUtils')
const mongoose = require('mongoose');


const getAllNotificationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1 }).withMessage('Limit must be a positive integer')
];

const markAsReadValidator = [
    body('notification_id')
      .exists().withMessage('Notification ID is required')
      .isMongoId().withMessage('Invalid notification ID format')
  ];

module.exports = {
    getAllNotificationsValidator,
    markAsReadValidator,

};
