const { check, body, query, validationResult } = require('express-validator');

const validateGetAllExistingConversations = [
  query('pageNum').optional().isInt({ min: 1 }).withMessage('pageNum should be a positive integer'),
  query('limitNum').optional().isInt({ min: 1 }).withMessage('limitNum should be a positive integer'),
  query('searchBy').optional().isString().withMessage('searchBy should be a string'),

];

const validateCanSendMessage = [
  query('recipientId')
    .exists().withMessage('Recipient ID is required')
    .isMongoId().withMessage('Recipient ID must be a valid MongoDB ObjectId'),
];


const validateMessage = [
  // recipientId is required and must be a valid ObjectId
  body('recipientId')
    .notEmpty().withMessage('recipientId is required.')
    .isMongoId().withMessage('Invalid recipientId.'),

  // if isExistingConversation is true, then conversationId is required and must be a valid ObjectId
  body('isExistingConversation').isBoolean().withMessage('isExistingConversation must be a boolean.'),
  body('conversationId').if(body('isExistingConversation').equals(true))
    .notEmpty().withMessage('conversationId is required when isExistingConversation is true.')
    .isMongoId().withMessage('Invalid conversationId.'),

  // if type is text, then text field is required
  body('text').if(body('type').equals('text'))
    .notEmpty().withMessage('Text is required for text type messages.')
    .isLength({ max: 500 }).withMessage('Text should be 500 characters or less.'),

  // Validate text length regardless of type
  body('text').optional().isLength({ max: 500 }).withMessage('Text should be 500 characters or less.'),

];

const validateGetAllMessagesForConversation = [
  query('conversationId').isMongoId().withMessage('Invalid conversation ID'),
  query('pageNum').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  query('limitNum').optional().isInt({ min: 1 }).withMessage('Limit number must be a positive integer'),
];

const validateMarkAsReadMessage = [
  body('messageId').isMongoId().withMessage('Invalid message ID'),
];

module.exports = { 
  validateGetAllExistingConversations, 
  validateCanSendMessage, 
  validateMessage, 
  validateGetAllMessagesForConversation,
  validateMarkAsReadMessage  

};
