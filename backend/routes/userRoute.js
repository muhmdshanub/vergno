const express = require('express');
const userController = require('../controllers/userController.js');
const peoplesController = require('../controllers/peoplesController.js')
const notificationsController = require('../controllers/notificationsController.js')
const topicController = require('../controllers/topicController.js')
const queryController = require('../controllers/queryController')
const perspectiveController = require('../controllers/perspectiveController.js')
const allPostsController = require('../controllers/allPostsController.js')
const commentController = require('../controllers/commentController.js')
const answerController = require('../controllers/answerController.js')
const messageController = require('../controllers/messageController.js')
const protectUser = require('../middlewares/userAuthMiddleware.js');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken.js');
const {uploadProfilePhoto, uploadQueryPhoto, uploadPerspectivePhoto} = require('../configs/multer.js');
const { validateUserProfileUpdate,validateUserRegistration,validateVerifyEmailOtp, validateUserLogin, validateVerifyOtpForgotPassword, validateForgotPassword, validateResetForgotPassword, validateFirebaseAuth, validateUpdateUserName, validateGetOtherUserProfileData, validateGetOtherUserAboutInfo, validateDiscoverEnable, updateEmailValidators, verifyOtpValidators } = require('../validators/userValidators');
const validate = require('../middlewares/validationMiddleware.js'); 
const { validateAutofillSuggestions, validatesuggestTopics, validateFollowTopic, validateGetAllQueriesForTopic, validateDetailsTopic } = require('../validators/topicValidator.js');
const { validateAddQuery, likeQueryValidator } = require('../validators/queryValidator.js');
const { addPerspectiveValidator, likePerspectiveValidator } = require('../validators/perspectiveValidator.js');
const { suggestPeoplesValidator, createFollowRequestValidator, allFollowRequestsValidator, declineFollowRequestValidator, blockUserValidator } = require('../validators/peoplesValidator.js');
const { getAllNotificationsValidator, markAsReadValidator } = require('../validators/notificationsValidator.js');
const { getAllPostsValidator, getAllQueriesForProfileValidator, getAllQueriesForOtherUserValidator, validateSavePost, validateUnsavePost } = require('../validators/allPostsValidator.js');
const { createAnswerValidator, getAnswersForQueryValidator, deleteQueryAnswerValidator } = require('../validators/answerValidator.js');
const { queryCommentValidator, queryReplyValidator, perspectiveCommentValidator, perspectiveReplyValidator, getCommentsForQueryValidator, getCommentsForPerspectiveValidator, getRepliesForQueryCommentValidator, getRepliesForPerspectiveCommentValidator, likeQueryCommentValidator, likePerspectiveCommentValidator, reportCommentValidator, deleteQueryCommentValidator, deleteAllPostReplyValidator } = require('../validators/commentValidator.js');
const { validateGetAllExistingConversations, validateCanSendMessage, validateMessage, validateGetAllMessagesForConversation, validateMarkAsReadMessage } = require('../validators/messageValidator.js');



const userRouter = express.Router();

// Define the route for user registration with multer middleware only if profilePhoto is present
userRouter.post('/signup',  uploadProfilePhoto.single('profilePhoto'), validateUserRegistration, validate, userController.registerUser);
userRouter.post('/resend-otp', validateUserRegistration, validate, userController.resendEmailOtp);
userRouter.post('/verify-email-otp',validateVerifyEmailOtp,validate, userController.verifyEmailOtp);
userRouter.post('/auth',validateUserLogin, validate, userController.authUser)
userRouter.post('/logout', protectUser, userController.logoutUser);
userRouter.all('/refresh-token', userController.refreshUserToken);


userRouter.post('/forgot-password',validateForgotPassword, validate, userController.forgotPassword)
userRouter.post('/verify-forgot-password-otp',validateVerifyOtpForgotPassword, validate, userController.verifyOtpForgotPassword)
userRouter.post('/reset-password',validateResetForgotPassword, validate, userController.resetForgotPassword)
userRouter.post('/firebase-auth-verify' , verifyFirebaseToken, userController.verifyFirebaseAuth)

userRouter.get('/peoples/suggestions',suggestPeoplesValidator, validate, protectUser, peoplesController.suggestPeoples);
userRouter.post('/peoples/follow',createFollowRequestValidator, validate, protectUser, peoplesController.createFollowRequest);
userRouter.delete('/peoples/follow',createFollowRequestValidator, validate, protectUser, peoplesController.deleteFollowRequest);
userRouter.get('/peoples/follow/requests/received',allFollowRequestsValidator, validate, protectUser,peoplesController.allFollowRequests)
userRouter.delete('/peoples/follow/decline',declineFollowRequestValidator, validate, protectUser, peoplesController.declineFollowRequest);
userRouter.post('/peoples/follow/accept',declineFollowRequestValidator, validate, protectUser, peoplesController.acceptFollowRequest);
userRouter.get('/peoples/followers',allFollowRequestsValidator, validate, protectUser,peoplesController.allFollowers)
userRouter.delete('/peoples/followers/remove',declineFollowRequestValidator, validate, protectUser, peoplesController.removeFollower);
userRouter.get('/peoples/followings',allFollowRequestsValidator, validate, protectUser,peoplesController.allFollowings)
userRouter.delete('/peoples/unfollow',createFollowRequestValidator, validate, protectUser, peoplesController.unfollow);
userRouter.post('/peoples/block',blockUserValidator, validate, protectUser, peoplesController.blockUser);
userRouter.get('/peoples/blockings',allFollowRequestsValidator, validate, protectUser, peoplesController.allBlockedUsers)
userRouter.delete('/peoples/unblock',blockUserValidator, validate, protectUser, peoplesController.unblockUser);

userRouter.get('/notifications/unread/count',protectUser, notificationsController.unreadCount);
userRouter.get('/notifications/all',getAllNotificationsValidator, validate, protectUser, notificationsController.getAllNotifications);
userRouter.post('/notifications/mark-as-read', markAsReadValidator, validate, protectUser, notificationsController.markAsRead)


userRouter.get('/topics/suggestions', validatesuggestTopics, validate, protectUser, topicController.suggestTopics)
userRouter.get('/topics/followings', validatesuggestTopics, validate, protectUser, topicController.getFollowingTopics)
userRouter.post('/topics/follow', validateFollowTopic, validate, protectUser, topicController.followTopic)
userRouter.delete('/topics/unfollow', validateFollowTopic, validate, protectUser, topicController.unfollowTopic)
userRouter.get('/topics/auto-fill/suggestions',validateAutofillSuggestions,validate, protectUser, topicController.autofillSuggestions)
userRouter.get('/topics/single/details', validateDetailsTopic, validate, protectUser, topicController.getTopicDetails)
userRouter.get('/topics/single/queries', validateGetAllQueriesForTopic, validate, protectUser, allPostsController.getAllQueriesForTopic)
userRouter.get('/topics/single/perspectives', validateGetAllQueriesForTopic, validate, protectUser, allPostsController.getAllPerspectivesForTopic)
userRouter.get('/topics/home/suggestions', protectUser, topicController.getTopicsSuggestionsForHome)


userRouter.post('/query/add-to-profile',   protectUser, uploadQueryPhoto.single('queryPhoto'),validateAddQuery, validate, queryController.addQueryToProfile)
userRouter.post('/query/like',likeQueryValidator, validate, protectUser, queryController.likeQuery)
userRouter.delete('/query/like',likeQueryValidator, validate, protectUser, queryController.unlikeQuery)

userRouter.post('/perspective/add-to-profile', protectUser, uploadPerspectivePhoto.single('perspectivePhoto'),addPerspectiveValidator, validate, perspectiveController.addPerspectiveToProfile)
userRouter.post('/perspective/like',likePerspectiveValidator, validate, protectUser, perspectiveController.likePerspective)
userRouter.delete('/perspective/like',likePerspectiveValidator, validate, protectUser, perspectiveController.unlikePerspective)

userRouter.get('/posts/all',getAllPostsValidator, validate, protectUser, allPostsController.getAllPosts)
userRouter.post('/posts/report', protectUser, allPostsController.reportPost)
userRouter.post('/posts/save', validateSavePost, validate, protectUser, allPostsController.savePost )
userRouter.delete('/posts/unSave', validateUnsavePost, validate, protectUser, allPostsController.unsavePost )
userRouter.get('/posts/saved', protectUser, allPostsController.getAllSavedPosts)



userRouter.post('/comments/query',queryCommentValidator, validate, protectUser, commentController.queryComment)
userRouter.post('/comments/reply/query',queryReplyValidator, validate, protectUser, commentController.queryReply)
userRouter.post('/comments/perspective',perspectiveCommentValidator, validate, protectUser, commentController.perspectiveComment)
userRouter.post('/comments/reply/perspective',perspectiveReplyValidator, validate, protectUser, commentController.perspectiveReply)
userRouter.get('/comments/all/query',getCommentsForQueryValidator, validate, protectUser, commentController.getCommentsForQuery)
userRouter.get('/comments/all/perspective',getCommentsForPerspectiveValidator, validate, protectUser, commentController.getCommentsForPerspective)

userRouter.get('/comments/reply/all/query',getRepliesForQueryCommentValidator, validate, protectUser, commentController.getRepliesForQueryComment)
userRouter.get('/comments/reply/all/perspective',getRepliesForPerspectiveCommentValidator, validate, protectUser, commentController.getRepliesForPerspectiveComment)

userRouter.post('/comments/query/like',likeQueryCommentValidator, validate, protectUser, commentController.likeQueryComment)
userRouter.delete('/comments/query/unlike',likeQueryCommentValidator, validate, protectUser, commentController.unlikeQueryComment)
userRouter.post('/comments/perspective/like',likePerspectiveCommentValidator, validate, protectUser, commentController.likePerspectiveComment)
userRouter.delete('/comments/perspective/unlike',likePerspectiveCommentValidator, validate, protectUser, commentController.unlikePerspectiveComment)
userRouter.post('/comments/report',reportCommentValidator, validate, protectUser, commentController.reportComment)

userRouter.delete('/comments/query/delete',deleteQueryCommentValidator, validate, protectUser, commentController.deleteQueryComment)
userRouter.delete('/comments/reply/query/delete',deleteAllPostReplyValidator, validate, protectUser, commentController.deleteQueryReply)
userRouter.delete('/comments/perspective/delete',deleteQueryCommentValidator, validate, protectUser, commentController.deletePerspectiveComment)
userRouter.delete('/comments/reply/perspective/delete',deleteAllPostReplyValidator, validate, protectUser, commentController.deletePerspectiveReply)

userRouter.post('/answers/add',createAnswerValidator, validate, protectUser, answerController.createAnswer)
userRouter.get('/answers/all',getAnswersForQueryValidator, validate, protectUser, answerController.getAnswersForQuery)
userRouter.post('/answers/report', protectUser, answerController.reportAnswer)
userRouter.delete('/answers/delete',deleteQueryAnswerValidator, validate, protectUser, answerController.deleteQueryAnswer)


userRouter.get('/profile/info', protectUser, userController.getUserProfileCardInfoForProfile)
userRouter.post('/profile/profile-photo/update', protectUser, uploadProfilePhoto.single('profilePhoto'), userController.updateProfilePictureFromProfile);
userRouter.post('/profile/name/update',validateUpdateUserName, validate, protectUser, userController.updateUserNameFromProfile)
userRouter.get('/profile/queries/all',getAllQueriesForProfileValidator, validate, protectUser, allPostsController.getAllQueriesForUserProfile)
userRouter.get('/profile/perspectives/all',getAllQueriesForProfileValidator, validate, protectUser, allPostsController.getAllPerspectivesForUserProfile);
userRouter.get('/profile/about', protectUser, userController.getUserAboutInfoForProfile)
userRouter.put('/profile/about/update',validateUserProfileUpdate, validate, protectUser, validateUserProfileUpdate, validate, userController.updateUserAboutForProfile)
userRouter.put('/profile/about/email/update',updateEmailValidators, validate, protectUser, userController.updateUserEmailForProfile )
userRouter.put('/profile/about/email/otp', verifyOtpValidators, validate, protectUser, userController.verifyUserEmailOtpForProfile)


userRouter.get('/profile/other-user/info',validateGetOtherUserProfileData, validate, protectUser, userController.getOtherUserProfileData)
userRouter.get('/profile/other-user/about',validateGetOtherUserAboutInfo, validate, protectUser, userController.getOtherUserAboutInfoForProfile)
userRouter.get('/profile/other-user/queries/all',getAllQueriesForOtherUserValidator, validate, protectUser, allPostsController.getAllQueriesForOtherUser)
userRouter.get('/profile/other-user/perspectives/all',getAllQueriesForOtherUserValidator, validate, protectUser, allPostsController.getAllPerspectivesForOtherUser);

userRouter.get('/message/conversations/existing/single',  protectUser, messageController.getSingleExistingConversation)
userRouter.get('/message/conversations/existing', validateGetAllExistingConversations, validate, protectUser, messageController.getAllExistingConversations)
userRouter.get('/message/conversations/new', validateGetAllExistingConversations, validate, protectUser, messageController.getAllNewConversations)
userRouter.get('/message/unreadCount', protectUser, messageController.getUnreadMessageCount)
userRouter.get('/message/check/canSendMessage',  protectUser, messageController.canSendMessage)


userRouter.post('/message/send', validateMessage, validate, protectUser, messageController.sendMessage)
userRouter.get('/message/all', validateGetAllMessagesForConversation, validate, protectUser, messageController.getAllMessagesForConversation)
userRouter.post('/message/read',  protectUser, messageController.markAsReadMessage)

userRouter.post('/discover/enable-toggle', validateDiscoverEnable, validate,  protectUser, userController.toggleEnableDiscover)
userRouter.get('/discover/enable-toggle',   protectUser, userController.gettoggleEnableDiscoverStatus)
userRouter.get('/discover/similar-users', protectUser, userController.discoverSimilarTopicFollowings)

userRouter.get('/search/global/people', protectUser, peoplesController.globalSearchPeople )
userRouter.get('/search/global/topics', protectUser, topicController.globalSearchTopic )
userRouter.get('/search/global/queries', protectUser, queryController.globalSearchQueries  )
userRouter.get('/search/global/perspectives', protectUser, perspectiveController.globalSearchPerspectives )

module.exports = userRouter;
