const express = require('express');
const adminController = require('../controllers/adminController.js');
const topicController = require('../controllers/topicController.js')
const userController = require('../controllers/userController.js')
const queryController = require('../controllers/queryController.js')
const perspectiveController = require('../controllers/perspectiveController.js')
const allPostsController = require('../controllers/allPostsController.js')
const commentController = require('../controllers/commentController.js')
const answerController = require('../controllers/answerController.js')
const protectAdmin = require('../middlewares/adminAuthMiddleware.js');
const { validateGetAllUsersInfoforAdmin, validateBlockUser, validateUnblockUser } = require('../validators/userValidators.js');
const { validateCreateTopic, validateGetAllTopicsForAdmin,  } = require('../validators/topicValidator.js');
const validate = require('../middlewares/validationMiddleware.js'); 
const { getAllQueryValidator, blockQueryValidator, getSingleQueryDetailsValidator, getReportsValidator, getAllReportsValidator } = require('../validators/queryValidator.js');
const { getAllPerspectiveDetailsForAdminValidator, blockPerspectiveFromAdminValidator, getSinglePerspectiveDetailsForAdminValidator, getAllReportsForSinglePerspectiveAdminValidator, getAllReportsForAllPerspectivesAdminValidator } = require('../validators/perspectiveValidator.js');
const { authAdminValidator } = require('../validators/adminValidator.js');
const { removeReportValidator } = require('../validators/allPostsValidator.js');
const { getAllBlockedAnswersValidator, unblockQueryAnswerValidator, getAllReportsForSingleAnswerValidator, removeReportOnAnswerValidator } = require('../validators/answerValidator.js');
const { getAllReportsForSingleCommentValidator, blockQueryCOmmentValidator, blockPerspectiveCOmmentValidator, getAllBlockedQueryCommentsValidator } = require('../validators/commentValidator.js');



const adminRouter = express.Router();

// Define the route for user registration with multer middleware only if profilePhoto is present
adminRouter.post('/signup',authAdminValidator, validate, adminController.registerAdmin);
adminRouter.post('/auth',authAdminValidator, validate, adminController.authAdmin);
adminRouter.post('/logout', protectAdmin, adminController.logoutAdmin);

adminRouter.get('/home/info', protectAdmin, adminController.getInfoForHome)

adminRouter.post('/topic/craete',validateCreateTopic,validate, protectAdmin, topicController.createTopic);
adminRouter.get('/topic/all',validateGetAllTopicsForAdmin, validate, protectAdmin, topicController.getAllTopicsForAdmin)

adminRouter.get('/users/all',validateGetAllUsersInfoforAdmin,validate, protectAdmin, userController.getAllUsersInfoforAdmin)
adminRouter.post('/users/block',validateBlockUser, validate, protectAdmin, userController.blockUserFromApplication)
adminRouter.post('/users/unblock',validateUnblockUser, validate, protectAdmin, userController.unblockUserFromApplication)

adminRouter.get('/queries/all',getAllQueryValidator, validate, protectAdmin, queryController.getAllQueryDetailsForAdmin)
adminRouter.post('/queries/block',blockQueryValidator,validate, protectAdmin, queryController.blockQueryFromAdmin)
adminRouter.post('/queries/unblock',blockQueryValidator,validate, protectAdmin, queryController.unblockQueryFromAdmin)
adminRouter.delete('/queries/delete',blockQueryValidator,validate, protectAdmin, queryController.deleteQueryFromAdmin)
adminRouter.get('/queries/',getSingleQueryDetailsValidator, validate, protectAdmin, queryController.getSingleQueryDetailsForAdmin)

adminRouter.get('/queries/reports/all',getReportsValidator, validate,  protectAdmin, queryController.getAllReportsForSingleQueryAdmin)
adminRouter.get('/queries/all/reports/all',getAllReportsValidator, validate, protectAdmin, queryController.getAllReportsForAllQueriesAdmin)

adminRouter.delete('/posts/report/delete',removeReportValidator, validate, protectAdmin, allPostsController.removeReportOnPost)

adminRouter.get('/perspectives/all',getAllPerspectiveDetailsForAdminValidator, validate, protectAdmin, perspectiveController.getAllPerspectiveDetailsForAdmin)
adminRouter.post('/perspectives/block',blockPerspectiveFromAdminValidator, validate, protectAdmin, perspectiveController.blockPerspectiveFromAdmin)
adminRouter.post('/perspectives/unblock',blockPerspectiveFromAdminValidator, validate, protectAdmin, perspectiveController.unblockPerspectiveFromAdmin)
adminRouter.delete('/perspectives/delete',blockPerspectiveFromAdminValidator, validate, protectAdmin, perspectiveController.deletePerspectiveFromAdmin)
adminRouter.get('/perspectives/',getSinglePerspectiveDetailsForAdminValidator, validate, protectAdmin, perspectiveController.getSinglePerspectiveDetailsForAdmin)

adminRouter.get('/perspectives/reports/all',getAllReportsForSinglePerspectiveAdminValidator, validate, protectAdmin, perspectiveController.getAllReportsForSinglePerspectiveAdmin)
adminRouter.get('/perspectives/all/reports/all',getAllReportsForAllPerspectivesAdminValidator, validate,  protectAdmin, perspectiveController.getAllReportsForAllPerspectivesAdmin)

adminRouter.get('/comments/reports/all',getAllReportsValidator, validate, protectAdmin, commentController.getAllReportsForAllCommentsFromAdmin)
adminRouter.get('/comments/reports/single',getAllReportsForSingleCommentValidator, validate, protectAdmin, commentController.getAllReportsForSingleCommentFromAdmin)
adminRouter.delete('/comments/reports/single/delete',removeReportValidator, validate, protectAdmin, commentController.removeReportOnCommentFromAdmin)
adminRouter.post('/comments/query/block',blockQueryCOmmentValidator, validate, protectAdmin, commentController.blockQueryCommentFromAdmin)
adminRouter.post('/comments/query/unblock',blockQueryCOmmentValidator, validate, protectAdmin, commentController.unblockQueryCommentFromAdmin)
adminRouter.delete('/comments/query/delete',blockQueryCOmmentValidator, validate, protectAdmin, commentController.deleteQueryCommentFromAdmin)
adminRouter.post('/comments/perspective/block',blockPerspectiveCOmmentValidator, validate, protectAdmin, commentController.blockPerspectiveCommentFromAdmin)
adminRouter.post('/comments/perspective/unblock',blockPerspectiveCOmmentValidator, validate, protectAdmin, commentController.unblockPerspectiveCommentFromAdmin)
adminRouter.delete('/comments/perspective/delete',blockPerspectiveCOmmentValidator, validate, protectAdmin, commentController.deletePerspectiveCommentFromAdmin)

adminRouter.get('/comments/query/blocked',getAllBlockedQueryCommentsValidator, validate, protectAdmin, commentController.getAllBlockedQueryComments)
adminRouter.get('/comments/perspective/blocked',getAllBlockedQueryCommentsValidator, validate, protectAdmin, commentController.getAllBlockedPerspectiveComments)

adminRouter.get('/answers/blocked',getAllBlockedAnswersValidator, validate, protectAdmin, answerController.getAllBlockedAnswersFromAdmin)
adminRouter.post('/answers/unblock',unblockQueryAnswerValidator, validate, protectAdmin, answerController.unblockQueryAnswerFromAdmin)
adminRouter.delete('/answers/delete',unblockQueryAnswerValidator, validate, protectAdmin, answerController.deleteQueryAnswerFromAdmin)

adminRouter.get('/answers/single/reports',getAllReportsForSingleAnswerValidator, validate, protectAdmin, answerController.getAllReportsForSingleAnswerFromAdmin)
adminRouter.delete('/answers/reports/delete',removeReportOnAnswerValidator, validate, protectAdmin, answerController.removeReportOnAnswerFromAdmin)


module.exports = adminRouter;
