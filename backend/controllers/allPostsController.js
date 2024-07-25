const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const Follow = require('../models/follow');
const Perspective = require('../models/perspective');
const Query = require('../models/query');
const QueryLike = require('../models/queryLike.js')
const PerspectiveLike = require('../models/perspectiveLike.js')
const ReportPost = require('../models/reportPost.js')
const BlockUser = require('../models/blockUser.js')
const PostSave = require('../models/PostSave.js')
const ensureUniqueIds = require('../utils/ensureUniqueIds.js')
const {

  get_Following_Users_All_Posts_helper,
  get_Following_Users_Perspectives_helper,
  get_Following_Users_Queries_helper,
  get_Following_Topics_Queries_helper,
  get_Following_Topics_Perspectives_helper,
  get_Following_Topics_All_Posts_helper,

} = require('../utils/postsHelpers.js')




const getAllPosts = asyncHandler(async (req, res) =>{

 
  const userId = req.user._id;
  
  const { postType = "all_posts", postSource = "from_all", page = 1, limit = 10 } = req.query;
  
  try {
      let posts = [];


      //from followed users
      if(postSource === 'from_all'){

        

            let posts_from_users = [];
            let posts_from_topics = [];

          if (postType === 'all_posts') {
            
            posts_from_users = await get_Following_Users_All_Posts_helper(userId, page, limit);
            posts_from_topics = await get_Following_Topics_All_Posts_helper(userId, page, limit);

  
          } else if (postType === 'queries') {
            
            posts_from_users = await get_Following_Users_Queries_helper(userId, page, limit);
            posts_from_topics = await get_Following_Topics_Queries_helper(userId, page, limit);
            
            
    
          } else if (postType === 'perspectives') {
            
            posts_from_users = await get_Following_Users_Perspectives_helper(userId, page, limit);
            posts_from_topics = await get_Following_Topics_Perspectives_helper(userId, page, limit);
          } else {
            res.status(400)
            throw new Error('Invalid postType specified')
          }

          //concating them
          const uniquePostsFromTopics = ensureUniqueIds(posts_from_users, posts_from_topics);
          posts = posts_from_users.concat(uniquePostsFromTopics);
          posts.sort((a, b) => (new Date(a.posted_at) > new Date(b.posted_at) ? -1 : 1));
          
          
          
      }

      //from followed users
      if(postSource === 'from_users'){

        
          if (postType === 'all_posts') {
            posts = await get_Following_Users_All_Posts_helper(userId, page, limit);
            
          } else if (postType === 'queries') {
            posts = await get_Following_Users_Queries_helper(userId, page, limit);
            
            
    
          } else if (postType === 'perspectives') {
            posts = await get_Following_Users_Perspectives_helper(userId, page, limit);
          } else {
            res.status(400)
            throw new Error('Invalid postType specified')
          }
      }
  
      

      //from followed topics
      if(postSource === 'from_topics'){

        if (postType === 'all_posts') {
          
          posts = await get_Following_Topics_All_Posts_helper(userId, page, limit);
          
          
        } else if (postType === 'queries') {
          posts = await get_Following_Topics_Queries_helper(userId, page, limit);
          
         
  
        } else if (postType === 'perspectives') {
          posts = await get_Following_Topics_Perspectives_helper(userId, page, limit);
        } else {
          res.status(400)
          throw new Error('Invalid postType specified')
        }
      }
  
      
      res.status(200).json({ posts });

    } catch (error) {
      console.error('Error fetching all posts:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }

})


// @desc    Report a post (query or perspective)
// @route   POST /api/reports
// @access  Private
const reportPost = asyncHandler(async (req, res) => {
  const { reason, post_type, post_source } = req.body;

  const post_id = mongoose.Types.ObjectId.isValid(req.body.post_id) ? new mongoose.Types.ObjectId(req.body.post_id) : null;
  
  // Validate input
  if (!reason || !post_type || !post_source || !post_id) {
    res.status(400);
    throw new Error('All fields are required');
  }

  try {

    // Check if a report from the same user on the same post already exists
    let existingReport = await ReportPost.findOne({
      reporter_id: req.user._id,
      post_id: post_id
    });

    if (existingReport) {
      // Update the existing report
      existingReport.reason = reason;
      const updatedReport = await existingReport.save();
      
      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: updatedReport
      });
      return;
    }


    // Create a new report
    const reportPost = new ReportPost({
      reporter_id: req.user._id,
      reason,
      post_type,
      post_source,
      post_id
    });

    // Save the report to the database
    const createdReport = await reportPost.save();

    // Count the reports for this post
    const reportCount = await ReportPost.countDocuments({
      post_id
    });

    // Check if the report count exceeds the threshold and update the isBlocked field
    if (reportCount > 100) {
      if (post_type === 'query' && post_source === 'user_profile') {
        await Query.findByIdAndUpdate(post_id, { isBlocked: true });
      } else if (post_type === 'perspective' && post_source === 'user_profile') {
        await Perspective.findByIdAndUpdate(post_id, { isBlocked: true });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.log(error)
    res.status(500);
    throw new Error('Error submitting the report');
  }
});

const removeReportOnPost = asyncHandler( async (req, res) =>{

  const { reportPost_Id } = req.body;

  
  try {
   
    // Find and delete the report
    const deletedReport = await ReportPost.findOneAndDelete({ _id: reportPost_Id });

    if (!deletedReport) {
      res.status(404)
      throw new Error('Report not found')
    }

    res.status(200).json({ success: true, data: deletedReport });

  } catch (error) {
    console.error('Error deleting report:', error.message);
    res.status(500)
    throw new Error('Failed to delete report')
  }
})




const getAllQueriesForUserProfile = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const { pageNum = 1, limitNum = 10 } = req.query;

  try {
    const userQueries = await Query.aggregate([
      {
        $match: {
          user: userId, // Match queries posted by the current user
          isBlocked: false, // Ensure the queries are not blocked
        },
      },
      {
        $sort: { posted_at: -1 }
      },
      {
        $skip: (pageNum - 1) * limitNum
      },
      {
        $limit: parseInt(limitNum)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data'
        }
      },
      {
        $lookup: {
          from: 'querylikes',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$query_id', '$$queryId'] },
                    { $eq: ['$user_id', userId] },
                  ],
                },
              },
            },
          ],
          as: 'user_like',
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $cond: {
              if: { $isArray: '$user_data' },
              then: {
                _id: { $arrayElemAt: ['$user_data._id', 0] },
                name: { $arrayElemAt: ['$user_data.name', 0] },
                image: { $arrayElemAt: ['$user_data.image', 0] },
                googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] },
              },
              else: {}
            }
          },
          title: 1,
          image: 1,
          description: 1,
          likeCount: 1,
          commentCount: 1,
          answerCount: 1,
          topic: { $arrayElemAt: ['$topic_data.name', 0] },
          posted_at: 1,
          isResolved: 1,
          isBlocked: 1,
          post_type: { $literal: 'queries' },
          post_source: { $literal: 'from_user' },
          isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } }
        },
      },
    ]);

    
    
    res.status(200).json({ queries: userQueries });
  } catch (error) {
    console.error('Error fetching user queries:', error);
    res.status(500).json({ message: 'Failed to fetch user queries' });
  }
});


const getAllPerspectivesForUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { pageNum = 1, limitNum = 10 } = req.query;

  try {
    const userPerspectives = await Perspective.aggregate([
      {
        $match: {
          user: userId, // Match perspectives posted by the current user
          isBlocked: false, // Ensure the perspectives are not blocked
        },
      },
      {
        $sort: { posted_at: -1 }
      },
      {
        $skip: (pageNum - 1) * limitNum
      },
      {
        $limit: parseInt(limitNum)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data'
        }
      },
      {
        $lookup: {
          from: 'perspectivelikes',
          let: { perspectiveId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$perspective_id', '$$perspectiveId'] },
                    { $eq: ['$user_id', userId] },
                  ],
                },
              },
            },
          ],
          as: 'user_like',
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $cond: {
              if: { $isArray: '$user_data' },
              then: {
                _id: { $arrayElemAt: ['$user_data._id', 0] },
                name: { $arrayElemAt: ['$user_data.name', 0] },
                image: { $arrayElemAt: ['$user_data.image', 0] },
                googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] },
              },
              else: {}
            }
          },
          title: 1,
          image: 1,
          description: 1,
          likeCount: 1,
          commentCount: 1,
          answerCount: 1,
          topic: { $arrayElemAt: ['$topic_data.name', 0] },
          posted_at: 1,
          isBlocked: 1,
          post_type: { $literal: 'perspectives' },
          post_source: { $literal: 'from_user' },
          isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } }
        },
      },
    ]);

    res.status(200).json({ perspectives: userPerspectives });
  } catch (error) {
    console.error('Error fetching user perspectives:', error);
    res.status(500).json({ message: 'Failed to fetch user perspectives' });
  }
});


const getAllQueriesForOtherUser = asyncHandler(async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.user._id);
  const requestedUserId = new mongoose.Types.ObjectId(req.query.userId);
  const userId = req.user._id;

  try {
    // Check if the requested user exists
    const requestedUser = await User.findById(requestedUserId);

    if (!requestedUser) {
      res.status(404);
      throw new Error('Requested user not found');
    }

    // Check if the requested user is blocked by the application
    if (requestedUser.isBlocked) {
      return res.json({
        isUserUnavailable: true,
        message: 'User data is unavailable at the moment.',
      });
    }

    // Check if the current user is blocked by the requested user
    const isBlockedByRequestedUser = await BlockUser.findOne({
      blocking_user_id: requestedUserId,
      blocked_user_id: currentUserId,
    });

    // Check if the requested user is blocked by the current user
    const isBlockedByCurrentUser = await BlockUser.findOne({
      blocking_user_id: currentUserId,
      blocked_user_id: requestedUserId,
    });

    // If either blocking relationship exists, respond accordingly
    if (isBlockedByRequestedUser || isBlockedByCurrentUser) {
      return res.json({
        isUserUnavailable: true,
        message: 'User data is unavailable at the moment.',
      });
    }

    // Proceed to fetch queries data for the requested user
    const { pageNum = 1, limitNum = 10 } = req.query;

    const userQueries = await Query.aggregate([
      {
        $match: {
          user: requestedUserId, // Match queries posted by the requested user
          isBlocked: false, // Ensure the queries are not blocked
        },
      },
      {
        $sort: { posted_at: -1 },
      },
      {
        $skip: (pageNum - 1) * limitNum,
      },
      {
        $limit: parseInt(limitNum),
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data',
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data',
        },
      },
      {
        $lookup: {
          from: 'querylikes',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$query_id', '$$queryId'] },
                    { $eq: ['$user_id', currentUserId] },
                  ],
                },
              },
            },
          ],
          as: 'user_like',
        },
      },
      {
        $lookup: {
          from: 'postsaves',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$queryId'] },
                    { $eq: ['$user', userId] },
                  ],
                },
              },
            },
          ],
          as: 'post_save',
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $cond: {
              if: { $isArray: '$user_data' },
              then: {
                _id: { $arrayElemAt: ['$user_data._id', 0] },
                name: { $arrayElemAt: ['$user_data.name', 0] },
                image: { $arrayElemAt: ['$user_data.image', 0] },
                googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] },
              },
              else: {},
            },
          },
          title: 1,
          image: 1,
          description: 1,
          likeCount: 1,
          commentCount: 1,
          answerCount: 1,
          topic: { $arrayElemAt: ['$topic_data.name', 0] },
          posted_at: 1,
          isResolved: 1,
          isBlocked: 1,
          post_type: { $literal: 'queries' },
          post_source: { $literal: 'from_user' },
          isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
          isPostSaved: { $cond: { if: { $gt: [{ $size: '$post_save' }, 0] }, then: true, else: false } },
          savedPostId: { $arrayElemAt: ['$post_save._id', 0] },
        },
      },
    ]);

    res.status(200).json({ queries: userQueries });
  } catch (error) {
    console.error('Error fetching user queries:', error);
    res.status(500).json({ message: 'Failed to fetch user queries' });
  }
});

const getAllPerspectivesForOtherUser = asyncHandler(async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.user._id);
  const requestedUserId = new mongoose.Types.ObjectId(req.query.userId);
  const userId = req.user._id;

  try {
    // Check if the requested user exists
    const requestedUser = await User.findById(requestedUserId);

    if (!requestedUser) {
      res.status(404);
      throw new Error('Requested user not found');
    }

    // Check if the requested user is blocked by the application
    if (requestedUser.isBlocked) {
      return res.json({
        isUserUnavailable: true,
        message: 'User data is unavailable at the moment.',
      });
    }

    // Check if the current user is blocked by the requested user
    const isBlockedByRequestedUser = await BlockUser.findOne({
      blocking_user_id: requestedUserId,
      blocked_user_id: currentUserId,
    });

    // Check if the requested user is blocked by the current user
    const isBlockedByCurrentUser = await BlockUser.findOne({
      blocking_user_id: currentUserId,
      blocked_user_id: requestedUserId,
    });

    // If either blocking relationship exists, respond accordingly
    if (isBlockedByRequestedUser || isBlockedByCurrentUser) {
      return res.json({
        isUserUnavailable: true,
        message: 'User data is unavailable at the moment.',
      });
    }

    // Proceed to fetch perspectives data for the requested user
    const { pageNum = 1, limitNum = 10 } = req.query;

    const userPerspectives = await Perspective.aggregate([
      {
        $match: {
          user: requestedUserId, // Match perspectives posted by the requested user
          isBlocked: false, // Ensure the perspectives are not blocked
        },
      },
      {
        $sort: { posted_at: -1 },
      },
      {
        $skip: (pageNum - 1) * limitNum,
      },
      {
        $limit: parseInt(limitNum),
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data',
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data',
        },
      },
      {
        $lookup: {
          from: 'perspectivelikes',
          let: { perspectiveId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$perspective_id', '$$perspectiveId'] },
                    { $eq: ['$user_id', currentUserId] },
                  ],
                },
              },
            },
          ],
          as: 'user_like',
        },
      },
      {
        $lookup: {
          from: 'postsaves',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$queryId'] },
                    { $eq: ['$user', userId] },
                  ],
                },
              },
            },
          ],
          as: 'post_save',
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $cond: {
              if: { $isArray: '$user_data' },
              then: {
                _id: { $arrayElemAt: ['$user_data._id', 0] },
                name: { $arrayElemAt: ['$user_data.name', 0] },
                image: { $arrayElemAt: ['$user_data.image', 0] },
                googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] },
              },
              else: {},
            },
          },
          title: 1,
          image: 1,
          description: 1,
          likeCount: 1,
          commentCount: 1,
          answerCount: 1,
          topic: { $arrayElemAt: ['$topic_data.name', 0] },
          posted_at: 1,
          isBlocked: 1,
          post_type: { $literal: 'perspectives' },
          post_source: { $literal: 'from_user' },
          isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
          isPostSaved: { $cond: { if: { $gt: [{ $size: '$post_save' }, 0] }, then: true, else: false } },
          savedPostId: { $arrayElemAt: ['$post_save._id', 0] },
        },
      },
    ]);

    res.status(200).json({ perspectives: userPerspectives });
  } catch (error) {
    console.error('Error fetching user perspectives:', error);
    res.status(500)
    throw new Error('Failed to fetch user perspectives')
  }
});


const getAllQueriesForTopic = asyncHandler(async (req, res) => {
  const { topicId, pageNum = 1, limitNum = 10 } = req.query;
  const userId = req.user._id;

  try {
    const options = {
      page: parseInt(pageNum, 10),
      limit: parseInt(limitNum, 10)
    };

    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          topic: new mongoose.Types.ObjectId(topicId), // Match queries by topicId
          isBlocked: false // Ensure the queries are not blocked
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data'
        }
      },
      {
        $lookup: {
          from: 'querylikes',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$query_id', '$$queryId'] },
                    { $eq: ['$user_id', currentUserId] }
                  ]
                }
              }
            }
          ],
          as: 'user_like'
        }
      },
      // Lookup to check if the current user has blocked the query user
      {
        $lookup: {
          from: 'blockusers',
          let: { queryUserId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blocking_user_id', currentUserId] },
                    { $eq: ['$blocked_user_id', '$$queryUserId'] }
                  ]
                }
              }
            }
          ],
          as: 'blocked_by_current_user'
        }
      },
      // Lookup to check if the query user has blocked the current user
      {
        $lookup: {
          from: 'blockusers',
          let: { queryUserId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blocking_user_id', '$$queryUserId'] },
                    { $eq: ['$blocked_user_id', currentUserId] }
                  ]
                }
              }
            }
          ],
          as: 'blocked_by_query_user'
        }
      },
      // Filter out blocked users
      {
        $match: {
          $and: [
            { 'user_data.isBlocked': false },
            { 'blocked_by_current_user': { $eq: [] } },
            { 'blocked_by_query_user': { $eq: [] } }
          ]
        }
      },
      {
        $sort: { posted_at: -1 } // Sort by most recent
      },
      {
        $skip: (options.page - 1) * options.limit // Skip records based on pagination
      },
      {
        $limit: options.limit // Limit the number of records based on pagination
      },
      {
        $lookup: {
          from: 'postsaves',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$queryId'] },
                    { $eq: ['$user', userId] },
                  ],
                },
              },
            },
          ],
          as: 'post_save',
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $cond: {
              if: { $isArray: '$user_data' },
              then: {
                _id: { $arrayElemAt: ['$user_data._id', 0] },
                name: { $arrayElemAt: ['$user_data.name', 0] },
                image: { $arrayElemAt: ['$user_data.image', 0] },
                googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] }
              },
              else: {}
            }
          },
          title: 1,
          image: 1,
          description: 1,
          likeCount: 1,
          commentCount: 1,
          answerCount: 1,
          topic: { $arrayElemAt: ['$topic_data.name', 0] },
          posted_at: 1,
          isResolved: 1,
          isBlocked: 1,
          post_type: { $literal: 'queries' },
          post_source: { $literal: 'from_topic' },
          isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
          isPostSaved: { $cond: { if: { $gt: [{ $size: '$post_save' }, 0] }, then: true, else: false } },
          savedPostId: { $arrayElemAt: ['$post_save._id', 0] },
        }
      }
    ];

    const queries = await Query.aggregate(pipeline);

    res.status(200).json({ success: true, queries });
  } catch (error) {
    console.error('Error fetching queries for topic:', error);
    res.status(500)
    throw new Error(`Failed to fetch queries for topic : ${error.message}`)
  }
});


const getAllPerspectivesForTopic = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { topicId, pageNum = 1, limitNum = 10 } = req.query;

  try {
    const options = {
      page: parseInt(pageNum, 10),
      limit: parseInt(limitNum, 10)
    };

    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          topic: new mongoose.Types.ObjectId(topicId), // Match queries by topicId
          isBlocked: false // Ensure the queries are not blocked
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data'
        }
      },
      {
        $lookup: {
          from: 'perspectivelikes',
          let: { perspectiveId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$perspective_id', '$$perspectiveId'] },
                    { $eq: ['$user_id', currentUserId] }
                  ]
                }
              }
            }
          ],
          as: 'user_like'
        }
      },
      // Lookup to check if the current user has blocked the perspective user
      {
        $lookup: {
          from: 'blockusers',
          let: { perspectiveUserId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blocking_user_id', currentUserId] },
                    { $eq: ['$blocked_user_id', '$$perspectiveUserId'] }
                  ]
                }
              }
            }
          ],
          as: 'blocked_by_current_user'
        }
      },
      // Lookup to check if the query user has blocked the current user
      {
        $lookup: {
          from: 'blockusers',
          let: { perspectiveUserId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blocking_user_id', '$$perspectiveUserId'] },
                    { $eq: ['$blocked_user_id', currentUserId] }
                  ]
                }
              }
            }
          ],
          as: 'blocked_by_perspective_user'
        }
      },
      // Filter out blocked users
      {
        $match: {
          $and: [
            { 'user_data.isBlocked': false },
            { 'blocked_by_current_user': { $eq: [] } },
            { 'blocked_by_perspective_user': { $eq: [] } }
          ]
        }
      },
      {
        $sort: { posted_at: -1 } // Sort by most recent
      },
      {
        $skip: (options.page - 1) * options.limit // Skip records based on pagination
      },
      {
        $limit: options.limit // Limit the number of records based on pagination
      },
      {
        $lookup: {
          from: 'postsaves',
          let: { queryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$queryId'] },
                    { $eq: ['$user', userId] },
                  ],
                },
              },
            },
          ],
          as: 'post_save',
        }
      },
      {
        $project: {
          _id: 1,
          user: {
            $cond: {
              if: { $isArray: '$user_data' },
              then: {
                _id: { $arrayElemAt: ['$user_data._id', 0] },
                name: { $arrayElemAt: ['$user_data.name', 0] },
                image: { $arrayElemAt: ['$user_data.image', 0] },
                googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] }
              },
              else: {}
            }
          },
          title: 1,
          image: 1,
          description: 1,
          likeCount: 1,
          commentCount: 1,
          answerCount: 1,
          topic: { $arrayElemAt: ['$topic_data.name', 0] },
          posted_at: 1,
          isResolved: 1,
          isBlocked: 1,
          post_type: { $literal: 'perspectives' },
          post_source: { $literal: 'from_topic' },
          isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
          isPostSaved: { $cond: { if: { $gt: [{ $size: '$post_save' }, 0] }, then: true, else: false } },
          savedPostId: { $arrayElemAt: ['$post_save._id', 0] },
        }
      }
    ];

    const perspectives = await Perspective.aggregate(pipeline);

    res.status(200).json({ success: true, perspectives });
  } catch (error) {
    console.error('Error fetching perspectives for topic:', error);
    res.status(500)
    throw new Error(`Failed to fetch perspectives for topic : ${error.message}`)
  }
});


const savePost = asyncHandler( async (req, res) => {

  const { postType, postId } = req.body;
  const userId = req.user._id;

  

  try {
    // Determine the post model based on postType
    const PostModel = postType === 'Query' ? Query : Perspective;

    // Find the post
    const post = await PostModel.findById(postId).populate('user');
    if (!post) {
      res.status(404)
      throw new Error('Post not found')
    }

    // Check if the post owner is not blocked by the application
    if (post.user.isBlocked) {
      res.status(403)
      throw new Error('Post owner is blocked by the application')
    }

    // Check if there is no block between the current user and the post owner
    const blockExists = await BlockUser.findOne({
      $or: [
        { blocking_user_id: userId, blocked_user_id: post.user._id },
        { blocking_user_id: post.user._id, blocked_user_id: userId }
      ]
    });

    if (blockExists) {
      res.status(403)
      throw new Error('Cannot save post due to block between users')
    }

     // Check if the post is already saved by the user
     const alreadySaved = await PostSave.findOne({
        user: userId,
        post: postId,
        postType
      });

    if (alreadySaved) {
      res.status(400);
      throw new Error('Post already saved');
    }

    // Save the post
    const postSave = new PostSave({
      user: userId,
      post: postId,
      postType
    });

    await postSave.save();
    res.status(201).json({ success : true, message: 'Post saved successfully', savedPostId : postSave._id });
  } catch (error) {
    console.error(error);
    res.status(500)
    throw new Error(`Server Error : ${error.message}`)
  }
})


const unsavePost = asyncHandler( async (req, res) => {
  

  const { savedPostId } = req.body;
  const userId = req.user._id;

  try {
    // Find the PostSave entry by ID
    const postSave = await PostSave.findById(savedPostId);

    // Check if the PostSave entry exists
    if (!postSave) {
      res.status(404)
      throw new Error('Saved post not found')
    }

    // Check if the user matches the user in the PostSave entry
    if (postSave.user.toString() !== userId.toString()) {
      res.status(403)
      throw new Error('User not authorized to unsave this post')
    }

    // Delete the PostSave entry
    await PostSave.findByIdAndDelete(savedPostId);

    res.status(200).json({ success: true, message: 'Post unsaved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '' });
    throw new Error(`Server error : ${error.message}`)
  }
})

const getAllSavedPosts = async (req, res) => {
  const userId = req.user._id; // Assuming the user ID is available in the request object
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const savedPosts = await PostSave.find({ user: userId })
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const postIds = savedPosts.map((post) => post.post);
    const postTypes = savedPosts.map((post) => post.postType);

    const queries = await Query.find({ _id: { $in: postIds }, isBlocked: false })
      .populate('user', '_id name image googleProfilePicture isBlocked')
      .populate('topic', 'name');

    const perspectives = await Perspective.find({ _id: { $in: postIds }, isBlocked: false })
      .populate('user', '_id name image googleProfilePicture isBlocked')
      .populate('topic', 'name');

    const posts = [];

    for (let i = 0; i < savedPosts.length; i++) {
      let post;
      if (postTypes[i] === 'Query') {
        post = queries.find((q) => q._id.equals(postIds[i]));
        if (post && !post.user.isBlocked) {
          const user_like = await QueryLike.findOne({ query_id: post._id, user_id: userId });
          const post_save = await PostSave.findOne({ post: post._id, user: userId });
          posts.push({
            _id: post._id,
            user: {
              _id: post.user._id,
              name: post.user.name,
              image: post.user.image,
              googleProfilePicture: post.user.googleProfilePicture,
            },
            title: post.title,
            image: post.image,
            description: post.description,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            answerCount: post.answerCount,
            topic: post.topic.name,
            posted_at: post.posted_at,
            isResolved: post.isResolved,
            isBlocked: post.isBlocked,
            post_type: 'queries',
            post_source: 'from_saved_posts',
            isLikedByUser: !!user_like,
            followStatus: 'following',
            isPostSaved: !!post_save,
            savedPostId: post_save._id,
            postSavedAt: post_save.savedAt,
          });
        }
      } else if (postTypes[i] === 'Perspective') {
        post = perspectives.find((p) => p._id.equals(postIds[i]));
        if (post && !post.user.isBlocked) {
          const user_like = await PerspectiveLike.findOne({ perspective_id: post._id, user_id: userId });
          const post_save = await PostSave.findOne({ post: post._id, user: userId });
          posts.push({
            _id: post._id,
            user: {
              _id: post.user._id,
              name: post.user.name,
              image: post.user.image,
              googleProfilePicture: post.user.googleProfilePicture,
            },
            title: post.title,
            image: post.image,
            description: post.description,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            topic: post.topic.name,
            posted_at: post.posted_at,
            isBlocked: post.isBlocked,
            isResolved: post.isResolved,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            post_type: 'perspectives',
            post_source: 'from_saved_posts',
            isLikedByUser: !!user_like,
            followStatus: 'following',
            isPostSaved: !!post_save,
            savedPostId: post_save._id,
            postSavedAt: post_save.savedAt,
          });
        }
      }
    }

    

    res.json({success: true,  posts });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500)
    throw new Error(`Error fetching saved posts : ${error.message}`)
  }
};

module.exports ={
    getAllPosts,
    reportPost,
    removeReportOnPost,
    getAllQueriesForUserProfile,
    getAllPerspectivesForUserProfile,
    getAllQueriesForOtherUser,
    getAllPerspectivesForOtherUser,
    getAllQueriesForTopic,
    getAllPerspectivesForTopic,
    savePost,
    unsavePost,
    getAllSavedPosts,
    
}