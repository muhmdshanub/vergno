const { body , query, check} = require('express-validator');
const mongoose = require('mongoose');

const createAnswerValidator = [
  body('answer_content')
    .isString().withMessage('Answer content must be a valid string')
    .trim()
    .isLength({ max: 500 }).withMessage('Answer content must be under 500 characters'),

  body('parent_query_id')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Parent query ID must be a valid ObjectId'),
];


const getAnswersForQueryValidator = [
    query('query_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid Query ID'),
      query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
  
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),
  ];
  const deleteQueryAnswerValidator = [
    body('answer_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid Answer ID'),
  ];

  const getAllBlockedAnswersValidator = [
    query('pageNum').optional().isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
    query('limitNum').optional().isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),
  ];

  const unblockQueryAnswerValidator = [
    body('answer_Id')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Answer ID'),
]


const getAllReportsForSingleAnswerValidator = [
    query('answerId')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Answer ID'),
    query('pageNum').optional().isInt().withMessage('Page number must be an integer'),
    query('limitNum').optional().isInt().withMessage('Limit number must be an integer'),

  ];

  const removeReportOnAnswerValidator = [
    body('reportAnswerId')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Answer ID'),
  ];
  
  

module.exports = {
    createAnswerValidator,
    getAnswersForQueryValidator,
    deleteQueryAnswerValidator,
    getAllBlockedAnswersValidator,
    unblockQueryAnswerValidator,
    getAllReportsForSingleAnswerValidator,
    removeReportOnAnswerValidator,

};
