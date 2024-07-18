const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const Follow = require('../models/follow');
const Perspective = require('../models/perspective');
const Query = require('../models/query');
const ReportPost = require('../models/reportPost.js')
const BlockUser = require('../models/blockUser.js')
const Topic = require("../models/topic.js");
const TopicFollow = require('../models/topicFollow.js')

const get_Following_Users_All_Posts_helper = async (userId, page = 1, limit = 10) => {

  

    try {
      const followedPosts = await Follow.aggregate([
        {
          $match: {
            following_user_id: userId, // Match the current user as following_user_id
            is_accepted: true, // Ensure follow request is accepted
          },
        },
        {
          $lookup: {
            from: 'users', // Assuming 'users' is your User collection
            localField: 'followed_user_id',
            foreignField: '_id',
            as: 'followed_user',
          },
        },
        {
          $unwind: '$followed_user',
        },
        {
          $facet: {
            // Aggregation pipeline for queries
            queries: [
              {
                $match: {
                  'followed_user.isBlocked': false, // Filter out followed users who are blocked
                },
              },
              {
                $lookup: {
                  from: 'queries', // Assuming 'queries' is your Query collection
                  let: { followedUserId: '$followed_user._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$user', '$$followedUserId'] }, // perspective user matches followed user ID
                            { $eq: ['$isBlocked', false] }, // Ensure the perspective is not blocked
                          ],
                        },
                      },
                    },
                    {
                      $sort: { posted_at: -1 }
                    },
                    {
                      $skip: (page - 1) * 10
                    },
                    {
                      $limit: 10
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
                              _id: { $arrayElemAt: ['$user_data._id', 0] }, // Extract _id from user_data array
                              name: { $arrayElemAt: ['$user_data.name', 0] }, // Extract name from user_data array
                              image: { $arrayElemAt: ['$user_data.image', 0] }, // Extract image from user_data array
                              googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] }, // Extract googleProfilePicture from user_data array
                            },
                            else: {} // Handle case where user_data array is empty or not an array
                          }
                        },
                        title: 1,
                        image: 1,
                        description: 1,
                        likeCount: 1,
                        commentCount:1,
                        answerCount:1,
                        topic: { $arrayElemAt: ['$topic_data.name', 0] }, // Extract topic name from topic_data array
                        posted_at: 1,
                        isResolved: 1,
                        isBlocked: 1,
                        post_type: { $literal: 'queries' },
                        post_source: { $literal: 'from_users' },
                        isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                        followStatus: { $literal: 'following' },
                      },
                    },
                  ],
                  as: 'query_posts',
                },
              },
              {
                $unwind: '$query_posts'
              },
              {
                $replaceRoot: { newRoot: '$query_posts' }
              }
            ],
            // Aggregation pipeline for perspectives (similar structure as queries)
            perspectives: [
              {
                $match: {
                  'followed_user.isBlocked': false, // Filter out followed users who are blocked
                },
              },
              {
                $lookup: {
                  from: 'perspectives', // Assuming 'perspectives' is your Perspective collection
                  let: { followedUserId: '$followed_user._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$user', '$$followedUserId'] }, // perspective user matches followed user ID
                            { $eq: ['$isBlocked', false] }, // Ensure the perspective is not blocked
                          ],
                        },
                      },
                    },
                    {
                      $sort: { posted_at: -1 }
                    },
                    {
                      $skip: (page - 1) * 10
                    },
                    {
                      $limit: 10
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
                              _id: { $arrayElemAt: ['$user_data._id', 0] }, // Extract _id from user_data array
                              name: { $arrayElemAt: ['$user_data.name', 0] }, // Extract name from user_data array
                              image: { $arrayElemAt: ['$user_data.image', 0] }, // Extract image from user_data array
                              googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] }, // Extract googleProfilePicture from user_data array
                            },
                            else: {} // Handle case where user_data array is empty or not an array
                          }
                        },
                        title: 1,
                        image: 1,
                        description: 1,
                        likeCount: 1,
                        commentCount:1,
                        topic: { $arrayElemAt: ['$topic_data.name', 0] }, // Extract topic name from topic_data array
                        posted_at: 1,
                        isBlocked: 1,
                        isResolved: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        post_type: { $literal: 'perspectives' },
                        post_source: { $literal: 'from_users' },
                        isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                        followStatus: { $literal: 'following' },
                      },
                    },
                  ],
                  as: 'perspective_posts',
                },
              },
              {
                $unwind: '$perspective_posts'
              },
              {
                $replaceRoot: { newRoot: '$perspective_posts' }
              }
            ],
          },
        },
        // Project to merge queries and perspectives into a single array
        {
          $project: {
            posts: { $concatArrays: ['$queries', '$perspectives'] },
          },
        },
        // Unwind the posts array to flatten it
        { $unwind: '$posts' },
        // Sort posts as needed, e.g., by posted_at descending
        { $sort: { 'posts.posted_at': -1 } },
        // Group to structure the final output
        {
          $group: {
            _id: null,
            posts: { $push: '$posts' },
          },
        },
        // Project to reshape the final output
        {
          $project: {
            _id: 0,
            posts: 1,
          },
        },
      ]);
  
      // Return the merged and structured posts
      return followedPosts.length > 0 ? followedPosts[0].posts : [];
    } catch (error) {
      console.error('Error fetching followed posts:', error);
      throw error;
    }
  };
   
  const get_Following_Users_Queries_helper = async (userId, page = 1, limit = 10) => {
    try {
      const followedQueries = await Follow.aggregate([
        {
          $match: {
            following_user_id: userId, // Match the current user as following_user_id
            is_accepted: true, // Ensure follow request is accepted
          },
        },
        {
          $lookup: {
            from: 'users', // Assuming 'users' is your User collection
            localField: 'followed_user_id',
            foreignField: '_id',
            as: 'followed_user',
          },
        },
        {
          $unwind: '$followed_user',
        },
        {
          $match: {
            'followed_user.isBlocked': false, // Filter out followed users who are blocked
          },
        },
        {
          $lookup: {
            from: 'queries', // Assuming 'queries' is your Query collection
            let: { followedUserId: '$followed_user._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user', '$$followedUserId'] }, // perspective user matches followed user ID
                      { $eq: ['$isBlocked', false] }, // Ensure the perspective is not blocked
                    ],
                  },
                },
              },
              {
                $sort: { posted_at: -1 }
              },
              {
                $skip: (page - 1) * 10
              },
              {
                $limit: 10
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
                          _id: { $arrayElemAt: ['$user_data._id', 0] }, // Extract _id from user_data array
                          name: { $arrayElemAt: ['$user_data.name', 0] }, // Extract name from user_data array
                          image: { $arrayElemAt: ['$user_data.image', 0] }, // Extract image from user_data array
                          googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] }, // Extract googleProfilePicture from user_data array
                        },
                        else: {} // Handle case where user_data array is empty or not an array
                      }
                  },
                  title: 1,
                  image: 1,
                  description: 1,
                  likeCount:1,
                  commentCount:1,
                  answerCount:1,
                  topic: { $arrayElemAt: ['$topic_data.name', 0] }, // Extract topic name from topic_data array
                  posted_at: 1,
                  isResolved: 1,
                  isBlocked: 1,
                  post_type: { $literal: 'queries' },
                  post_source: { $literal: 'from_users' },
                  isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                  followStatus: { $literal: 'following' },
                },
              },
            ],
            as: 'posts',
          },
        },
        {
          $unwind: '$posts'
        },
        {
          $replaceRoot: { newRoot: '$posts' }
        },
      ]);
  
      // Return the merged and structured posts
      
      return followedQueries;
    } catch (error) {
      console.error('Error fetching followed queries:', error);
      throw error;
    }
  };
  
  
  const get_Following_Users_Perspectives_helper = async (userId, page = 1, limit = 10) => {
    try {
      const followedQueries = await Follow.aggregate([
        {
          $match: {
            following_user_id: userId, // Match the current user as following_user_id
            is_accepted: true, // Ensure follow request is accepted
          },
        },
        {
          $lookup: {
            from: 'users', // Assuming 'users' is your User collection
            localField: 'followed_user_id',
            foreignField: '_id',
            as: 'followed_user',
          },
        },
        {
          $unwind: '$followed_user',
        },
        {
          $match: {
            'followed_user.isBlocked': false, // Filter out followed users who are blocked
          },
        },
        {
          $lookup: {
            from: 'perspectives', // Assuming 'perspectives' is your Query collection
            let: { followedUserId: '$followed_user._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user', '$$followedUserId'] }, // perspective user matches followed user ID
                      { $eq: ['$isBlocked', false] }, // Ensure the perspective is not blocked
                    ],
                  },
                },
              },
              {
                $sort: { posted_at: -1 }
              },
              {
                $skip: (page - 1) * 10
              },
              {
                $limit: 10
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
                          _id: { $arrayElemAt: ['$user_data._id', 0] }, // Extract _id from user_data array
                          name: { $arrayElemAt: ['$user_data.name', 0] }, // Extract name from user_data array
                          image: { $arrayElemAt: ['$user_data.image', 0] }, // Extract image from user_data array
                          googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] }, // Extract googleProfilePicture from user_data array
                        },
                        else: {} // Handle case where user_data array is empty or not an array
                      }
                  },
                  title: 1,
                  image: 1,
                  description: 1,
                  likeCount:1,
                  commentCount:1,
                  answerCount:1,
                  topic: { $arrayElemAt: ['$topic_data.name', 0] }, // Extract topic name from topic_data array
                  posted_at: 1,
                  isBlocked: 1,
                  post_type: { $literal: 'perspectives' },
                  post_source: { $literal: 'from_users' },
                  isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                  followStatus: { $literal: 'following' },

                },
              },
            ],
            as: 'posts',
          },
        },
        {
          $unwind: '$posts'
        },
        {
          $replaceRoot: { newRoot: '$posts' }
        },
      ]);
  
      // Return the merged and structured posts
      
      return followedQueries;
    } catch (error) {
      console.error('Error fetching followed queries:', error);
      throw error;
    }
  };


const get_Following_Topics_Queries_helper = async (userId, page = 1, limit = 10) => {
    try {
      const followedTopicQueries = await TopicFollow.aggregate([
        {
          $match: {
            user_id: userId, // Match the current user as the follower of the topic
          },
        },
        {
          $lookup: {
            from: 'queries', // Assuming 'queries' is your Query collection
            let: { followedTopicId: '$topic_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$topic', '$$followedTopicId'] }, // Match queries from the followed topics
                      { $eq: ['$isBlocked', false] }, // Ensure the query is not blocked
                    ],
                  },
                },
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
                $unwind: '$user_data',
              },
              {
                $match: {
                  'user_data.isBlocked': false, // Ensure the query owner is not blocked
                },
              },
              {
                $match: {
                  'user_data._id': { $ne: userId }, // Exclude posts from the current user
                },
              },
              {
                $lookup: {
                  from: 'blockusers',
                  let: { queryOwnerId: '$user_data._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $or: [
                            { $and: [{ $eq: ['$blocking_user_id', userId] }, { $eq: ['$blocked_user_id', '$$queryOwnerId'] }] }, // Check if the current user blocked the query owner
                            { $and: [{ $eq: ['$blocking_user_id', '$$queryOwnerId'] }, { $eq: ['$blocked_user_id', userId] }] }, // Check if the query owner blocked the current user
                          ],
                        },
                      },
                    },
                  ],
                  as: 'block_data',
                },
              },
              {
                $match: {
                  'block_data': { $eq: [] }, // Ensure there's no blocking relationship
                },
              },
              {
                $lookup: {
                  from: 'follows',
                  let: { queryOwnerId: '$user_data._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$following_user_id', userId] },
                            { $eq: ['$followed_user_id', '$$queryOwnerId'] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'follow_data',
                },
              },
              {
                $sort: { posted_at: -1 },
              },
              {
                $skip: (page - 1) * limit,
              },
              {
                $limit: parseInt(limit),
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
                            { $eq: ['$user_id', userId] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'user_like',
                },
              },
              {
                $project: {
                  _id: 1,
                  user: {
                    _id: '$user_data._id',
                    name: '$user_data.name',
                    image: '$user_data.image',
                    googleProfilePicture: '$user_data.googleProfilePicture',
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
                  post_source: { $literal: 'from_topics' },
                  isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                  followStatus: {
                    $cond: {
                      if: { $gt: [{ $size: '$follow_data' }, 0] },
                      then: {
                        $cond: {
                          if: { $eq: [{ $arrayElemAt: ['$follow_data.is_accepted', 0] }, true] },
                          then: 'following',
                          else: 'pending',
                        },
                      },
                      else: 'notFollowing',
                    },
                  },
                },
              },
            ],
            as: 'posts',
          },
        },
        {
          $unwind: '$posts',
        },
        {
          $replaceRoot: { newRoot: '$posts' },
        },
      ]);
  
      return followedTopicQueries;
    } catch (error) {
      console.error('Error fetching followed topic queries:', error);
      throw error;
    }
  };


const get_Following_Topics_Perspectives_helper = async (userId, page = 1, limit = 10) => {
    try {
      const followedTopicPerspectives = await TopicFollow.aggregate([
        {
          $match: {
            user_id: userId, // Match the current user as the follower of the topic
          },
        },
        {
          $lookup: {
            from: 'perspectives', // Assuming 'perspectives' is your Perspective collection
            let: { followedTopicId: '$topic_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$topic', '$$followedTopicId'] }, // Match perspectives from the followed topics
                      { $eq: ['$isBlocked', false] }, // Ensure the perspective is not blocked
                    ],
                  },
                },
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
                $unwind: '$user_data',
              },
              {
                $match: {
                  'user_data.isBlocked': false, // Ensure the perspective owner is not blocked
                },
              },
              {
                $match: {
                  'user_data._id': { $ne: userId }, // Exclude posts from the current user
                },
              },
              {
                $lookup: {
                  from: 'blockusers',
                  let: { perspectiveOwnerId: '$user_data._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $or: [
                            { $and: [{ $eq: ['$blocking_user_id', userId] }, { $eq: ['$blocked_user_id', '$$perspectiveOwnerId'] }] }, // Check if the current user blocked the perspective owner
                            { $and: [{ $eq: ['$blocking_user_id', '$$perspectiveOwnerId'] }, { $eq: ['$blocked_user_id', userId] }] }, // Check if the perspective owner blocked the current user
                          ],
                        },
                      },
                    },
                  ],
                  as: 'block_data',
                },
              },
              {
                $match: {
                  'block_data': { $eq: [] }, // Ensure there's no blocking relationship
                },
              },
              {
                $lookup: {
                  from: 'follows',
                  let: { perspectiveOwnerId: '$user_data._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$following_user_id', userId] },
                            { $eq: ['$followed_user_id', '$$perspectiveOwnerId'] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'follow_data',
                },
              },
              {
                $sort: { posted_at: -1 },
              },
              {
                $skip: (page - 1) * limit,
              },
              {
                $limit: parseInt(limit),
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
                            { $eq: ['$user_id', userId] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'user_like',
                },
              },
              {
                $project: {
                  _id: 1,
                  user: {
                    _id: '$user_data._id',
                    name: '$user_data.name',
                    image: '$user_data.image',
                    googleProfilePicture: '$user_data.googleProfilePicture',
                  },
                  title: 1,
                  image: 1,
                  description: 1,
                  likeCount: 1,
                  commentCount: 1,
                  topic: { $arrayElemAt: ['$topic_data.name', 0] },
                  posted_at: 1,
                  isBlocked: 1,
                  post_type: { $literal: 'perspectives' },
                  post_source: { $literal: 'from_topics' },
                  isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                  followStatus: {
                    $cond: {
                      if: { $gt: [{ $size: '$follow_data' }, 0] },
                      then: {
                        $cond: {
                          if: { $eq: [{ $arrayElemAt: ['$follow_data.is_accepted', 0] }, true] },
                          then: 'following',
                          else: 'pending',
                        },
                      },
                      else: 'notFollowing',
                    },
                  },
                },
              },
            ],
            as: 'posts',
          },
        },
        {
          $unwind: '$posts',
        },
        {
          $replaceRoot: { newRoot: '$posts' },
        },
      ]);
  
      return followedTopicPerspectives;
    } catch (error) {
      console.error('Error fetching followed topic perspectives:', error);
      throw error;
    }
  };


const get_Following_Topics_All_Posts_helper = async (userId, page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
  
      const followedTopicPosts = await TopicFollow.aggregate([
        {
          $match: { user_id: userId },
        },
        {
          $facet: {
            queries: [
              {
                $lookup: {
                  from: 'queries',
                  let: { followedTopicId: '$topic_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$topic', '$$followedTopicId'] },
                            { $eq: ['$isBlocked', false] },
                          ],
                        },
                      },
                    },
                    {
                      $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user_data',
                      },
                    },
                    { $unwind: '$user_data' },
                    {
                      $match: { 'user_data.isBlocked': false },
                    },
                    {
                        $match: {
                          'user_data._id': { $ne: userId }, // Exclude posts from the current user
                        },
                    },
                    {
                      $lookup: {
                        from: 'blockusers',
                        let: { queryOwnerId: '$user_data._id' },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $or: [
                                  { $and: [{ $eq: ['$blocking_user_id', userId] }, { $eq: ['$blocked_user_id', '$$queryOwnerId'] }] },
                                  { $and: [{ $eq: ['$blocking_user_id', '$$queryOwnerId'] }, { $eq: ['$blocked_user_id', userId] }] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'block_data',
                      },
                    },
                    {
                      $match: { 'block_data': { $eq: [] } },
                    },
                    {
                      $lookup: {
                        from: 'follows',
                        let: { queryOwnerId: '$user_data._id' },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ['$following_user_id', userId] },
                                  { $eq: ['$followed_user_id', '$$queryOwnerId'] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'follow_data',
                      },
                    },
                    { $sort: { posted_at: -1 } },
                    { $skip: skip },
                    { $limit: parseInt(limit) },
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
                                  { $eq: ['$user_id', userId] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'user_like',
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        user: {
                          _id: '$user_data._id',
                          name: '$user_data.name',
                          image: '$user_data.image',
                          googleProfilePicture: '$user_data.googleProfilePicture',
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
                        post_source: { $literal: 'from_topics' },
                        isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                        followStatus: {
                          $cond: {
                            if: { $gt: [{ $size: '$follow_data' }, 0] },
                            then: {
                              $cond: {
                                if: { $eq: [{ $arrayElemAt: ['$follow_data.is_accepted', 0] }, true] },
                                then: 'following',
                                else: 'pending',
                              },
                            },
                            else: 'notFollowing',
                          },
                        },
                      },
                    },
                  ],
                  as: 'posts',
                },
              },
              { $unwind: '$posts' },
              { $replaceRoot: { newRoot: '$posts' } },
            ],
            perspectives: [
              {
                $lookup: {
                  from: 'perspectives',
                  let: { followedTopicId: '$topic_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$topic', '$$followedTopicId'] },
                            { $eq: ['$isBlocked', false] },
                          ],
                        },
                      },
                    },
                    {
                      $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user_data',
                      },
                    },
                    { $unwind: '$user_data' },
                    {
                      $match: { 'user_data.isBlocked': false },
                    },
                    {
                        $match: {
                          'user_data._id': { $ne: userId }, // Exclude posts from the current user
                        },
                    },
                    {
                      $lookup: {
                        from: 'blockusers',
                        let: { perspectiveOwnerId: '$user_data._id' },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $or: [
                                  { $and: [{ $eq: ['$blocking_user_id', userId] }, { $eq: ['$blocked_user_id', '$$perspectiveOwnerId'] }] },
                                  { $and: [{ $eq: ['$blocking_user_id', '$$perspectiveOwnerId'] }, { $eq: ['$blocked_user_id', userId] }] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'block_data',
                      },
                    },
                    {
                      $match: { 'block_data': { $eq: [] } },
                    },
                    {
                      $lookup: {
                        from: 'follows',
                        let: { perspectiveOwnerId: '$user_data._id' },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [
                                  { $eq: ['$following_user_id', userId] },
                                  { $eq: ['$followed_user_id', '$$perspectiveOwnerId'] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'follow_data',
                      },
                    },
                    { $sort: { posted_at: -1 } },
                    { $skip: skip },
                    { $limit: parseInt(limit) },
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
                                  { $eq: ['$user_id', userId] },
                                ],
                              },
                            },
                          },
                        ],
                        as: 'user_like',
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        user: {
                          _id: '$user_data._id',
                          name: '$user_data.name',
                          image: '$user_data.image',
                          googleProfilePicture: '$user_data.googleProfilePicture',
                        },
                        title: 1,
                        image: 1,
                        description: 1,
                        likeCount: 1,
                        commentCount: 1,
                        topic: { $arrayElemAt: ['$topic_data.name', 0] },
                        posted_at: 1,
                        isBlocked: 1,
                        post_type: { $literal: 'perspectives' },
                        post_source: { $literal: 'from_topics' },
                        isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                        followStatus: {
                          $cond: {
                            if: { $gt: [{ $size: '$follow_data' }, 0] },
                            then: {
                              $cond: {
                                if: { $eq: [{ $arrayElemAt: ['$follow_data.is_accepted', 0] }, true] },
                                then: 'following',
                                else: 'pending',
                              },
                            },
                            else: 'notFollowing',
                          },
                        },
                      },
                    },
                  ],
                  as: 'posts',
                },
              },
              { $unwind: '$posts' },
              { $replaceRoot: { newRoot: '$posts' } },
            ],
          },
        },
        { $project: { posts: { $concatArrays: ['$queries', '$perspectives'] } } },
        { $unwind: '$posts' },
        { $replaceRoot: { newRoot: '$posts' } },
      ]);
  
      return followedTopicPosts;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch following topics posts');
    }
  };

  module.exports = {

    get_Following_Users_All_Posts_helper,
    get_Following_Users_Perspectives_helper,
    get_Following_Users_Queries_helper,
    get_Following_Topics_Queries_helper,
    get_Following_Topics_Perspectives_helper,
    get_Following_Topics_All_Posts_helper,
  }