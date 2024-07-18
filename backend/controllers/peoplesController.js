const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const mongoose = require("mongoose");
const Follow = require('../models/follow');
const Notification = require('../models/notification')
const BlockUser = require('../models/blockUser')
const Topic = require('../models/topic')
const TopicFollow = require('../models/topicFollow')



const suggestPeoples = asyncHandler(async (req, res) => {
    const { page = 1, limit = 9 } = req.query;
  
    try {
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      };
  
      const pipeline = [
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(req.user._id) }, // Exclude current user
            isBlocked: false // Filter out blocked users
          }
        },
        {
          $lookup: {
            from: 'follows',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$following_user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Match current user as following user
                      { $eq: ['$followed_user_id', '$$userId'] } // Match user in users collection with followed user in follows collection
                    ]
                  }
                }
              }
            ],
            as: 'followedUsers'
          }
        },
        {
          $lookup: {
            from: 'blockusers',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { 
                        $and: [
                          { $eq: ['$blocking_user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Match current user as blocking user
                          { $eq: ['$blocked_user_id', '$$userId'] } // Match user in users collection with blocked user in blockusers collection
                        ]
                      },
                      { 
                        $and: [
                          { $eq: ['$blocking_user_id', '$$userId'] }, // Match user in users collection as blocking user
                          { $eq: ['$blocked_user_id', new mongoose.Types.ObjectId(req.user._id)] } // Match current user as blocked user
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'blockedUsers'
          }
        },
        {
          $match: {
            followedUsers: { $size: 0 }, // Exclude users already followed by the requesting user
            blockedUsers: { $size: 0 } // Exclude users who have blocked the current user or have been blocked by the current user
          }
        },
        {
          $skip: (options.page - 1) * options.limit // Skip records based on pagination
        },
        {
          $limit: options.limit // Limit the number of records based on pagination
        },
        {
          $lookup: {
            from: 'topicfollows',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$user_id', '$$userId']
                  }
                }
              },
              {
                $limit: 3 // Limit to at most 3 topic follows per user
              },
              {
                $lookup: {
                  from: 'topics',
                  localField: 'topic_id',
                  foreignField: '_id',
                  as: 'topicDetails'
                }
              },
              {
                $unwind: '$topicDetails'
              }
            ],
            as: 'followingTopics'
          }
        },
        {
          $project: {
            password: 0 // Exclude password field
          }
        },
      ];
  
      const suggestedUsers = await User.aggregate(pipeline);
  
      res.status(200).json({ success: true, message: 'Suggested users fetched successfully', data: suggestedUsers });
    } catch (error) {
        console.log(error)
      res.status(500);
      throw new Error('Error fetching suggested users.', error);
      
    }
  });



const createFollowRequest = asyncHandler(async (req, res) => {
    const { followed_user_id } = req.body;
    const following_user_id = req.user._id;
    const { io } = req;
  
    try {
      // Convert user IDs to ObjectId
      const followingUserIdObj = new mongoose.Types.ObjectId(following_user_id);
      const followedUserIdObj = new mongoose.Types.ObjectId(followed_user_id);
  
      // Check if either user has the isBlocked flag set to true
      const followingUser = await User.findById(followingUserIdObj);
      const followedUser = await User.findById(followedUserIdObj);
  
      if (followingUser.isBlocked || followedUser.isBlocked) {
        return res.status(400).json({
          status: 'error',
          message: 'One of the users is blocked and cannot create follow requests.',
        });
      }
  
      // Check if there is an existing block relationship
      const isBlockedByCurrentUser = await BlockUser.findOne({
        blocking_user_id: following_user_id,
        blocked_user_id: followed_user_id,
      });
  
      const isBlockedByRequestedUser = await BlockUser.findOne({
        blocking_user_id: followed_user_id,
        blocked_user_id: following_user_id,
      });
  
      if (isBlockedByCurrentUser || isBlockedByRequestedUser) {
        return res.status(400).json({
          status: 'error',
          message: 'One of the users has blocked the other and cannot create follow requests.',
        });
      }
  
      // Check if follow request already exists
      const existingFollow = await Follow.findOne({ following_user_id, followed_user_id });
      if (existingFollow) {
        return res.status(400).json({
          status: 'error',
          message: 'Follow request already exists',
        });
      }
  
      // Create new follow request
      const follow = new Follow({ following_user_id, followed_user_id });
      const createdFollow = await follow.save();
  
      // Create notification
      const notification = new Notification({
        user_id: followed_user_id, // The user who receives the notification
        type: 'follow_request',
        message: 'You have a new follow request',
        metadata: {
          requester_id: following_user_id,
          item_id: createdFollow._id, // Include follow request ID
        },
      });
  
      await notification.save();
  
      // Emit Socket.io event to notify the user who received the follow request
      io.to(`${followed_user_id}`).emit('new_follow_request', (acknowledgment) => {
        if (acknowledgment) {
          console.log(`Notification sent to user ${followed_user_id} successfully`);
        } else {
          console.error(`Failed to send notification to user ${followed_user_id}`);
        }
      });
  
      res.status(201).json({
        status: 'success',
        success : true,
        message: 'Follow request sent successfully',
        createdFollow,
      });
    } catch (error) {
      console.error('Error creating follow request:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create follow request',
      });
    }
  });

const deleteFollowRequest = asyncHandler(async (req, res) => {
    const { followed_user_id } = req.body;
    const following_user_id = req.user._id;

    
  
    // Check if follow request already exists
    const existingFollow = await Follow.findOne({ following_user_id, followed_user_id });
    if (!existingFollow) {
      res.status(400);
      throw new Error('Follow request does not exists');
    }
  
    // Delete the follow request
    await existingFollow.deleteOne();
  
    res.status(201).json({ status:"success",message: 'Follow request deleted successfully' });
  });

  const allFollowRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 9 } = req.query;
    const currentUserId = req.user._id;
  
    // Paginate follow requests sent to the current user
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { created_at: -1 } // Sort by creation date in descending order
    };
  
    // Fetch follow requests with pagination and count total follow requests
    const followRequests = await Follow.aggregate([
      { $match: { followed_user_id: currentUserId, is_accepted: false } }, // Common matching operation
      {
        $facet: {
          // Perform count operation
          totalCount: [
            { $count: "total" }
          ],
          // Perform pagination and lookup operations
          data: [
            { $sort: { created_at: -1 } }, // Sort by creation date in descending order
            { $skip: ((options.page - 1) * options.limit) }, // Skip records based on pagination
            { $limit: options.limit }, // Limit records based on pagination
            {
              $lookup: {
                from: 'users', // Assuming the collection name is 'users'
                localField: 'following_user_id',
                foreignField: '_id',
                as: 'follower'
              }
            },
            { $unwind: '$follower' }, // Convert 'follower' array to object
            {
              $lookup: {
                from: 'topicfollows',
                let: { userId: '$follower._id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$user_id', '$$userId']
                      }
                    }
                  },
                  {
                    $limit: 3 // Limit to at most 3 topic follows per user
                  },
                  {
                    $lookup: {
                      from: 'topics',
                      localField: 'topic_id',
                      foreignField: '_id',
                      as: 'topicDetails'
                    }
                  },
                  {
                    $unwind: '$topicDetails'
                  }
                ],
                as: 'followingTopics'
              }
            },
            {
              $project: {
                _id: '$follower._id', // Only include the user ID
                name: '$follower.name', // Include the user's name
                image: '$follower.image', // Include the user's image
                googleProfilePicture: '$follower.googleProfilePicture', // Include the user's Google profile picture
                userId: '$follower._id', // Include the user ID (for consistency)
                followingTopics: {
                  $map: {
                    input: '$followingTopics',
                    as: 'topic',
                    in: {
                      _id: '$$topic.topicDetails._id',
                      name: '$$topic.topicDetails.name',
                      description: '$$topic.topicDetails.description'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    ]);
  
    // Extracting the results from the facet stage
    const totalCount = followRequests[0].totalCount[0] ? followRequests[0].totalCount[0].total : 0;
    const data = followRequests[0].data;
  
    res.status(200).json({ userData: data, totalCount });
  });
  


  // @desc    delete a follow request
// @route   Delete /api/follows
// @access  Private
const declineFollowRequest = asyncHandler(async (req, res) => {
    const { following_user_id } = req.body;
    const followed_user_id = req.user._id;

    
  
    // Check if follow request already exists
    const existingFollow = await Follow.findOne({ following_user_id, followed_user_id });
    if (!existingFollow) {
      res.status(400);
      throw new Error('Follow request does not exists');
    }
  
    // Delete the follow request
    await existingFollow.deleteOne();
  
    res.status(201).json({ status:"success",message: 'Follow request declined successfully' });
  });


// @desc    accept a follow request
// @route   POST /api/follows/accept
// @access  Private
const acceptFollowRequest = asyncHandler(async (req, res) => {
    
    const { following_user_id } = req.body;
    const followed_user_id = req.user._id;

    try {
        // Check if follow request already exists
        const existingFollow = await Follow.findOne({ following_user_id, followed_user_id });
        if (!existingFollow) {
            res.status(400);
            throw new Error('Follow request does not exist');
        }

        // Accept the follow request
        existingFollow.is_accepted = true;
        await existingFollow.save();

        // Create a notification for the accepted follow request
        const notification = new Notification({
            user_id: following_user_id, // The user who sent the follow request
            type: 'follow_request_accepted',
            message: 'Your follow request has been accepted',
            metadata: {
                accepter_id: followed_user_id,
                item_id: existingFollow._id // Include follow request ID
            }
        });
        await notification.save();

        // Emit Socket.io event to notify the user who received the follow request
        req.io.to(`${following_user_id}`).emit('follow_request_accepted', (acknowledgment) => {
            if (acknowledgment) {
                console.log(`Notification sent to user ${following_user_id} successfully`);
            } else {
                console.error(`Failed to send notification to user ${following_user_id}`);
            }
    });

        res.status(200).json({ status: "success", message: 'Follow request accepted successfully' });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});


// @desc    all followers data
// @route   POST /api/followers
// @access  Private

const allFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, sortBy = "default" } = req.query;
  const currentUserId = req.user._id;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  // Combined pipeline for sorting by latest (descending) and old (ascending)
  const latestAndOldPipeline = [
    { 
      $match: { followed_user_id: currentUserId, is_accepted: true } // Match followers of the current user
    },
    { 
      $sort: { created_at: sortBy === 'latest' ? -1 : 1 } // Sort by created_at in descending order (latest) or ascending (old)
    },
    {
      $facet: {
        // Perform count operation
        totalCount: [
          { $count: "total" }
        ],
        // Perform pagination and lookup operations
        data: [
          { $skip: ((options.page - 1) * options.limit) }, // Skip records based on pagination
          { $limit: options.limit }, // Limit records based on pagination
          {
            $lookup: {
              from: 'users', // Assuming the collection name is 'users'
              localField: 'following_user_id',
              foreignField: '_id',
              as: 'follower'
            }
          },
          { $unwind: '$follower' }, // Convert 'follower' array to object
          {
            $lookup: {
              from: 'topicfollows',
              let: { userId: '$follower._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$user_id', '$$userId']
                    }
                  }
                },
                { 
                  $limit: 3 // Limit to at most 3 topic follows per user
                },
                {
                  $lookup: {
                    from: 'topics',
                    localField: 'topic_id',
                    foreignField: '_id',
                    as: 'topicDetails'
                  }
                },
                { $unwind: '$topicDetails' }
              ],
              as: 'followingTopics'
            }
          },
          {
            $project: {
              _id: '$follower._id', // Only include the user ID
              name: '$follower.name', // Include the user's name
              email: '$follower.email', // Include the user's email
              image: '$follower.image', // Include the user's image
              googleProfilePicture: '$follower.googleProfilePicture', // Include the user's Google profile picture
              userId: '$follower._id', // Include the user ID (for consistency)
              created_at: 1, // Include the creation date
              followingTopics: {
                $map: {
                  input: '$followingTopics',
                  as: 'topic',
                  in: {
                    _id: '$$topic.topicDetails._id',
                    name: '$$topic.topicDetails.name',
                    description: '$$topic.topicDetails.description'
                  }
                }
              }
            }
          }
        ]
      }
    }
  ];

  // Pipeline for default sorting
  const defaultPipeline = [
    { $match: { followed_user_id: currentUserId, is_accepted: true } }, // Match followers of the current user
    {
      $facet: {
        // Perform count operation
        totalCount: [
          { $count: "total" }
        ],
        // Perform pagination and lookup operations
        data: [
          {
            $lookup: {
              from: 'users', // Assuming the collection name is 'users'
              localField: 'following_user_id',
              foreignField: '_id',
              as: 'follower'
            }
          },
          { $unwind: '$follower' }, // Convert 'follower' array to object
          { $sort: { 'follower.name': 1 } }, // Sort by name (follower.name)
          { $skip: ((options.page - 1) * options.limit) }, // Skip records based on pagination
          { $limit: options.limit }, // Limit records based on pagination
          {
            $lookup: {
              from: 'topicfollows',
              let: { userId: '$follower._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$user_id', '$$userId']
                    }
                  }
                },
                { 
                  $limit: 3 // Limit to at most 3 topic follows per user
                },
                {
                  $lookup: {
                    from: 'topics',
                    localField: 'topic_id',
                    foreignField: '_id',
                    as: 'topicDetails'
                  }
                },
                { $unwind: '$topicDetails' }
              ],
              as: 'followingTopics'
            }
          },
          {
            $project: {
              _id: '$follower._id', // Only include the user ID
              name: '$follower.name', // Include the user's name
              email: '$follower.email', // Include the user's email
              image: '$follower.image', // Include the user's image
              googleProfilePicture: '$follower.googleProfilePicture', // Include the user's Google profile picture
              userId: '$follower._id', // Include the user ID (for consistency)
              followingTopics: {
                $map: {
                  input: '$followingTopics',
                  as: 'topic',
                  in: {
                    _id: '$$topic.topicDetails._id',
                    name: '$$topic.topicDetails.name',
                    description: '$$topic.topicDetails.description'
                  }
                }
              }
            }
          }
        ]
      }
    }
  ];

  const pipeline = (sortBy === "default") ? defaultPipeline : latestAndOldPipeline;

  // Fetch followers with pagination and count total followers
  const followers = await Follow.aggregate(pipeline);

  // Extracting the results from the facet stage
  const totalCount = followers[0].totalCount[0] ? followers[0].totalCount[0].total : 0;
  const data = followers[0].data;

  res.status(200).json({ userData: data, totalCount });
});


const blockUser = asyncHandler(async (req, res) =>{

        // Ensure userId and queryId are ObjectId
        const blocking_user_id = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
        const blocked_user_id = mongoose.Types.ObjectId.isValid(req.body.blockedUserId) ? (new mongoose.Types.ObjectId(req.body.blockedUserId)) : null;

        // Validate ObjectId format
        if (!blocking_user_id || !blocked_user_id) {
            res.status(400);
            throw new Error('Invalid user IDs');
        }


        // Check if the users exist
        const blockingUser = await User.findById(blocking_user_id);
        const blockedUser = await User.findById(blocked_user_id);

        if (!blockingUser || !blockedUser) {
            res.status(404)
            throw new Error('User not found');
        }


        if (blocking_user_id === blocked_user_id) {
            res.status(400);
            throw new Error('A user cannot block themselves');
        }

         // Check if the block already exists
        const existingBlock = await BlockUser.findOne({ blocking_user_id, blocked_user_id });

        if (existingBlock) {
            res.status(400)
            throw new Error('User is already blocked');
        }

        // Remove any follow relationship between the users
        await Follow.deleteOne({ following_user_id: blocking_user_id, followed_user_id: blocked_user_id });
        await Follow.deleteOne({ following_user_id: blocked_user_id, followed_user_id: blocking_user_id });

        // Create a new block entry
        const blockUser = new BlockUser({
            blocking_user_id,
            blocked_user_id
        });
    
        await blockUser.save();
    
        res.status(201).json({ message: 'User blocked successfully' });
})


  // @desc    remove a follower
// @route   Delete /api/follows
// @access  Private
const removeFollower = asyncHandler(async (req, res) => {
    const { following_user_id } = req.body;
    const followed_user_id = req.user._id;

    
  
    try{
        // Check if follow request already exists
    const existingFollow = await Follow.findOne({ following_user_id, followed_user_id });
    if (!existingFollow) {
      res.status(400);
      throw new Error('Follow request does not exists');
    }
  
    // Delete the follow request
    await existingFollow.deleteOne();
  
    res.status(201).json({ status:"success",message: 'Follower removed successfully' });
    }catch(error){
        res.status(500);
        throw new Error('Failed to remove the follower');
    }
  });


  // @desc    all followeings data
// @route   GET /api/followings
// @access  Private

const allFollowings = asyncHandler(async (req, res) => {
    
    const { page = 1, limit = 9, sortBy = 'default' } = req.query;
    const currentUserId = req.user._id;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    // Combined pipeline for sorting by latest (descending) and old (ascending)
    const latestAndOldPipeline = [
      { 
        $match: { following_user_id: currentUserId, is_accepted: true } // Match followers of the current user
      },
      { 
        $sort: { created_at: sortBy === 'latest' ? -1 : 1 } // Sort by created_at in descending order (latest) or ascending (old)
      },
      {
        $facet: {
          // Perform count operation
          totalCount: [
            { $count: "total" }
          ],
          // Perform pagination and lookup operations
          data: [
            { $skip: ((options.page - 1) * options.limit) }, // Skip records based on pagination
            { $limit: options.limit }, // Limit records based on pagination
            {
              $lookup: {
                from: 'users', // Assuming the collection name is 'users'
                localField: 'followed_user_id',
                foreignField: '_id',
                as: 'follower'
              }
            },
            { $unwind: '$follower' }, // Convert 'follower' array to object
            {
              $lookup: {
                from: 'topicfollows',
                let: { userId: '$follower._id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$user_id', '$$userId']
                      }
                    }
                  },
                  { $limit: 3 }, // Limit to at most 3 topic follows per user
                  {
                    $lookup: {
                      from: 'topics',
                      localField: 'topic_id',
                      foreignField: '_id',
                      as: 'topicDetails'
                    }
                  },
                  { $unwind: '$topicDetails' }
                ],
                as: 'followingTopics'
              }
            },
            {
              $project: {
                _id: '$follower._id', // Only include the user ID
                name: '$follower.name', // Include the user's name
                email: '$follower.email', // Include the user's email
                image: '$follower.image', // Include the user's image
                googleProfilePicture: '$follower.googleProfilePicture', // Include the user's Google profile picture
                userId: '$follower._id', // Include the user ID (for consistency)
                created_at: 1, // Include the creation date
                followingTopics: {
                  $map: {
                    input: '$followingTopics',
                    as: 'topic',
                    in: {
                      _id: '$$topic.topicDetails._id',
                      name: '$$topic.topicDetails.name',
                      description: '$$topic.topicDetails.description'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    ];
    

    //pipeline for default sorting
    const defaultPipeline = [
      { $match: { following_user_id: currentUserId, is_accepted: true } }, // Match followers of the current user
      {
        $facet: {
          // Perform count operation
          totalCount: [
            { $count: "total" }
          ],
          // Perform pagination and lookup operations
          data: [
            {
              $lookup: {
                from: 'users', // Assuming the collection name is 'users'
                localField: 'followed_user_id',
                foreignField: '_id',
                as: 'follower'
              }
            },
            { $unwind: '$follower' }, // Convert 'follower' array to object
            {
              $project: {
                _id: '$follower._id', // Only include the user ID
                name: '$follower.name', // Include the user's name
                email: '$follower.email', // Include the user's email
                image: '$follower.image', // Include the user's image
                googleProfilePicture: '$follower.googleProfilePicture', // Include the user's Google profile picture
                userId: '$follower._id' // Include the user ID (for consistency)
              }
            },
            { $sort: { name: 1 } }, // Sort by name
            { $skip: ((options.page - 1) * options.limit) }, // Skip records based on pagination
            { $limit: options.limit }, // Limit records based on pagination
            {
              $lookup: {
                from: 'topicfollows',
                let: { userId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$user_id', '$$userId']
                      }
                    }
                  },
                  { $limit: 3 }, // Limit to at most 3 topic follows per user
                  {
                    $lookup: {
                      from: 'topics',
                      localField: 'topic_id',
                      foreignField: '_id',
                      as: 'topicDetails'
                    }
                  },
                  { $unwind: '$topicDetails' }
                ],
                as: 'followingTopics'
              }
            },
            {
              $project: {
                _id: '$_id', // Only include the user ID
                name: '$name', // Include the user's name
                email: '$email', // Include the user's email
                image: '$image', // Include the user's image
                googleProfilePicture: '$googleProfilePicture', // Include the user's Google profile picture
                userId: '$_id', // Include the user ID (for consistency)
                followingTopics: {
                  $map: {
                    input: '$followingTopics',
                    as: 'topic',
                    in: {
                      _id: '$$topic.topicDetails._id',
                      name: '$$topic.topicDetails.name',
                      description: '$$topic.topicDetails.description'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    ];
    


    const pipeline = (sortBy === "default") ? defaultPipeline : latestAndOldPipeline;

    // Fetch followers with pagination and count total followers
    const followers = await Follow.aggregate(pipeline);

    // Extracting the results from the facet stage
    const totalCount = followers[0].totalCount[0] ? followers[0].totalCount[0].total : 0;
    const data = followers[0].data;

    res.status(200).json({ userData: data, totalCount });
});


    // @desc    unfollow
// @route   Delete /api/unfollow
// @access  Private
const unfollow = asyncHandler(async (req, res) => {
    const { followed_user_id } = req.body;
    const  following_user_id = req.user._id;

    
  
    try{
        // Check if follow request already exists
    const existingFollow = await Follow.findOne({ following_user_id, followed_user_id });
    if (!existingFollow) {
      res.status(400);
      throw new Error('Follow request does not exists');
    }
  
    // Delete the follow request
    await existingFollow.deleteOne();
  
    res.status(201).json({ status:"success",message: 'unfollowed succesfully' });
    }catch(error){
        res.status(500);
        throw new Error('Failed to unfollow');
    }
  });

  const allBlockedUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 9, sortBy = 'default' } = req.query;
    const currentUserId = req.user._id;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const defaultPipeline = [
        { $match: { blocking_user_id: currentUserId } },
        {
            $facet: {
                totalCount: [{ $count: "total" }],
                data: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'blocked_user_id',
                            foreignField: '_id',
                            as: 'blockedUser'
                        }
                    },
                    { $unwind: '$blockedUser' },
                    {
                        $project: {
                            _id: '$blockedUser._id',
                            name: '$blockedUser.name',
                            email: '$blockedUser.email',
                            image: '$blockedUser.image',
                            googleProfilePicture: '$blockedUser.googleProfilePicture',
                            userId: '$blockedUser._id',
                            created_at: 1
                        }
                    },
                    { $sort: { name: 1 } },
                    { $skip: ((options.page - 1) * options.limit) },
                    { $limit: options.limit },
                    {
                        $lookup: {
                            from: 'topicfollows',
                            let: { userId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$user_id', '$$userId']
                                        }
                                    }
                                },
                                { $limit: 3 }, // Limit to at most 3 topic follows per user
                                {
                                    $lookup: {
                                        from: 'topics',
                                        localField: 'topic_id',
                                        foreignField: '_id',
                                        as: 'topicDetails'
                                    }
                                },
                                { $unwind: '$topicDetails' }
                            ],
                            as: 'followingTopics'
                        }
                    },
                    {
                        $project: {
                            _id: '$_id',
                            name: '$name',
                            email: '$email',
                            image: '$image',
                            googleProfilePicture: '$googleProfilePicture',
                            userId: '$_id',
                            created_at: 1,
                            followingTopics: {
                                $map: {
                                    input: '$followingTopics',
                                    as: 'topic',
                                    in: {
                                        _id: '$$topic.topicDetails._id',
                                        name: '$$topic.topicDetails.name',
                                        description: '$$topic.topicDetails.description'
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    ];

    const latestAndOldPipeline = [
        { $match: { blocking_user_id: currentUserId } },
        { $sort: { created_at: sortBy === 'latest' ? -1 : 1 } },
        {
            $facet: {
                totalCount: [{ $count: "total" }],
                data: [
                    { $skip: ((options.page - 1) * options.limit) },
                    { $limit: options.limit },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'blocked_user_id',
                            foreignField: '_id',
                            as: 'blockedUser'
                        }
                    },
                    { $unwind: '$blockedUser' },
                    {
                        $project: {
                            _id: '$blockedUser._id',
                            name: '$blockedUser.name',
                            email: '$blockedUser.email',
                            image: '$blockedUser.image',
                            googleProfilePicture: '$blockedUser.googleProfilePicture',
                            userId: '$blockedUser._id',
                            created_at: 1
                        }
                    },
                    {
                        $lookup: {
                            from: 'topicfollows',
                            let: { userId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$user_id', '$$userId']
                                        }
                                    }
                                },
                                { $limit: 3 }, // Limit to at most 3 topic follows per user
                                {
                                    $lookup: {
                                        from: 'topics',
                                        localField: 'topic_id',
                                        foreignField: '_id',
                                        as: 'topicDetails'
                                    }
                                },
                                { $unwind: '$topicDetails' }
                            ],
                            as: 'followingTopics'
                        }
                    },
                    {
                        $project: {
                            _id: '$_id',
                            name: '$name',
                            email: '$email',
                            image: '$image',
                            googleProfilePicture: '$googleProfilePicture',
                            userId: '$_id',
                            created_at: 1,
                            followingTopics: {
                                $map: {
                                    input: '$followingTopics',
                                    as: 'topic',
                                    in: {
                                        _id: '$$topic.topicDetails._id',
                                        name: '$$topic.topicDetails.name',
                                        description: '$$topic.topicDetails.description'
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    ];

    const pipeline = (sortBy === 'default') ? defaultPipeline : latestAndOldPipeline;

    try {
        const blockedUsers = await BlockUser.aggregate(pipeline);

        const totalCount = blockedUsers[0].totalCount[0] ? blockedUsers[0].totalCount[0].total : 0;
        const data = blockedUsers[0].data;

        res.status(200).json({ userData: data, totalCount });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching the blocked users', error: error.message });
    }
});

const unblockUser = asyncHandler(async (req, res) => {
  // Ensure userId and queryId are ObjectId
  const blocking_user_id = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
  const blocked_user_id = mongoose.Types.ObjectId.isValid(req.body.blockedUserId) ? (new mongoose.Types.ObjectId(req.body.blockedUserId)) : null;

  // Validate ObjectId format
  if (!blocking_user_id || !blocked_user_id) {
      res.status(400);
      throw new Error('Invalid user IDs');
  }

  // Check if the users exist
  const blockingUser = await User.findById(blocking_user_id);
  const blockedUser = await User.findById(blocked_user_id);

  if (!blockingUser || !blockedUser) {
      res.status(404);
      throw new Error('User not found');
  }

  if (blocking_user_id.equals(blocked_user_id)) {
      res.status(400);
      throw new Error('A user cannot unblock themselves');
  }

  // Check if the block exists
  const existingBlock = await BlockUser.findOne({ blocking_user_id, blocked_user_id });

  if (!existingBlock) {
      res.status(400);
      throw new Error('User is not blocked');
  }

  // Remove the block entry
  await BlockUser.deleteOne({ blocking_user_id, blocked_user_id });

  res.status(200).json({ message: 'User unblocked successfully' });
});


module.exports ={
    suggestPeoples,
    createFollowRequest,
    deleteFollowRequest,
    allFollowRequests,
    declineFollowRequest,
    acceptFollowRequest,
    allFollowers,
    removeFollower,
    allFollowings,
    unfollow,
    blockUser,
    allBlockedUsers,
    unblockUser,



}