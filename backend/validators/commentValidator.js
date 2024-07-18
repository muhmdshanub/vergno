const { body,query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const queryCommentValidator = [
  body('comment_content')
    .isString().withMessage('Comment content must be a string')
    .trim()
    .isLength({ min: 1 }).withMessage('Comment content must not be empty')
    .isLength({ max: 500 }).withMessage('Comment content must be under 500 characters'),
  body('parent_query_id')
    .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Query ID'),
];

const queryReplyValidator = [
    body('comment_content')
      .isString().withMessage('Reply content must be a string')
      .trim()
      .isLength({ min: 1 }).withMessage('Reply content must not be empty')
      .isLength({ max: 500 }).withMessage('Reply content must be under 500 characters'),
    body('parent_query_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Query ID'),
    body('parent_comment_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
  ];


  const perspectiveCommentValidator = [
    body('comment_content')
      .isString().withMessage('Comment content must be a string')
      .trim()
      .isLength({ min: 1 }).withMessage('Comment content must not be empty')
      .isLength({ max: 500 }).withMessage('Comment content must be under 500 characters'),
    body('parent_perspective_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Perspective ID'),
  ];

const perspectiveReplyValidator = [
  body('comment_content')
    .isString().withMessage('Reply content must be a string')
    .trim()
    .isLength({ min: 1 }).withMessage('Reply content must not be empty')
    .isLength({ max: 500 }).withMessage('Reply content must be under 500 characters'),
  body('parent_perspective_id')
    .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Perspective ID'),
  body('parent_comment_id')
    .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Parent Comment ID'),
 
];

const getCommentsForQueryValidator = [
    query('query_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Query ID'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ];

  const getCommentsForPerspectiveValidator = [
    query('perspective_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Perspective ID'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ];


  const getRepliesForQueryCommentValidator = [
    query('query_comment_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ];

  const getRepliesForPerspectiveCommentValidator = [
    query('perspective_comment_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Perspective Comment ID'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ];

  const likeQueryCommentValidator = [
    body('queryCommentId')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
  
  ];

  const likePerspectiveCommentValidator = [
    body('perspectiveCommentId')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
  
  ];

  const reportCommentValidator = [
    body('reason')
      .notEmpty().withMessage('Reason is required'),
    body('comment_type')
      .notEmpty().withMessage('Comment type is required'),
    body('comment_source')
      .notEmpty().withMessage('Comment source is required'),
    body('comment_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
  ];

  const deleteQueryCommentValidator = [
    body('comment_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
  
  ];

  const deleteAllPostReplyValidator = [
    body('reply_id')
      .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Comment ID'),
  
  ];

  const getAllReportsValidator = [
    query('sortBy').optional().isIn(['latest', 'oldest']).withMessage('Invalid sortBy parameter'),
    query('pageNum').optional().isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
    query('limitNum').optional().isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),
  ];

const getAllReportsForSingleCommentValidator = [
    query('commentId').exists().isMongoId().withMessage('Invalid commentId'),
    query('pageNum').optional().isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
    query('limitNum').optional().isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),
  ];

const removeReportValidator = [
  body('reportComment_Id').exists().isMongoId().withMessage('Invalid reportComment_Id'),

];

const blockQueryCOmmentValidator = [
    body('queryComment_Id').exists().isMongoId().withMessage('Invalid queryComment_Id'),
  
  ];

  const blockPerspectiveCOmmentValidator = [
    body('perspectiveComment_Id').exists().isMongoId().withMessage('Invalid perspectiveComment_Id'),
  
  ];

  const getAllBlockedQueryCommentsValidator = [
    query('pageNum').optional().isInt({ min: 1 }).withMessage('pageNum must be a positive integer'),
    query('limitNum').optional().isInt({ min: 1 }).withMessage('limitNum must be a positive integer'),
    ];

module.exports = {
    queryCommentValidator,
    queryReplyValidator,
    perspectiveCommentValidator,
    perspectiveReplyValidator ,
    getCommentsForQueryValidator,
    getCommentsForPerspectiveValidator,
    getRepliesForQueryCommentValidator,
    getRepliesForPerspectiveCommentValidator,
    likeQueryCommentValidator,
    likePerspectiveCommentValidator,
    reportCommentValidator,
    deleteQueryCommentValidator,
    deleteAllPostReplyValidator,
    getAllReportsValidator,
    getAllReportsForSingleCommentValidator,
    removeReportValidator,
    blockQueryCOmmentValidator,
    blockPerspectiveCOmmentValidator,
    getAllBlockedQueryCommentsValidator,
    

};
