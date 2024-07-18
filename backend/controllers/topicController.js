const asyncHandler = require("express-async-handler");
const Topic = require("../models/topic.js");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const TopicFollow = require('../models/topicFollow.js')


const createTopic = asyncHandler(async (req, res) => {
    const { name, description} = req.body;

    const existingTopic = await Topic.findOne({ name });

    if (existingTopic) {
        res.status(400)
        throw new Error('A topic with the same name already exists.')
    }
  
    try {
      // Create the topic
      const newTopic = new Topic({
        name,
        description,
      });
  
      const savedTopic = await newTopic.save();
      res.status(201).json(savedTopic);
    } catch (error) {
      res.status(500).json({ error: 'Error creating topic.' + error.message });
    }
  });

const autofillSuggestions = asyncHandler( async (req, res) =>{
  const searchQuery = req.query.search;

  try {
    // Escape the search query to prevent injection attacks
    const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
    const regex = new RegExp(escapedSearchQuery, 'i'); // Create a case-insensitive regex

    const topics = await Topic.find({ name: regex }).select('name _id');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
})


const getAllTopicsForAdmin = async (req, res) => {
  const { pageNum = 1, limitNum = 10, sortBy = 'default' } = req.query;

  try {
    const page = parseInt(pageNum, 10);
    const limit = parseInt(limitNum, 10);

    let sortCriteria;
    switch (sortBy) {
      case 'latest':
        sortCriteria = { created_at: -1 };
        break;
      case 'oldest':
        sortCriteria = { created_at: 1 };
        break;
      case 'default':
      default:
        sortCriteria = { name: 1 }; // Alphabetical order
        break;
    }

    const topics = await Topic.aggregate([
      {
        $facet: {
          totalTopics: [{ $count: 'count' }],
          paginatedTopics: [
            {
              $sort: sortCriteria
            },
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            },
            {
              $lookup: {
                from: 'topicfollows',
                localField: '_id',
                foreignField: 'topic_id',
                as: 'followers'
              }
            },
            {
              $lookup: {
                from: 'queries',
                localField: '_id',
                foreignField: 'topic',
                as: 'queries'
              }
            },
            {
              $lookup: {
                from: 'perspectives',
                localField: '_id',
                foreignField: 'topic',
                as: 'perspectives'
              }
            },
            {
              $addFields: {
                followersCount: { $size: '$followers' },
                queriesCount: { $size: '$queries' },
                perspectivesCount: { $size: '$perspectives' }
              }
            },
            {
              $project: {
                name: 1,
                description: 1,
                created_at: 1,
                followersCount: 1,
                queriesCount: 1,
                perspectivesCount: 1
              }
            }
          ]
        }
      }
    ]);

    const totalTopics = topics.length > 0 ? topics[0].totalTopics[0].count : 0;

    res.json({
      topics: topics[0].paginatedTopics,
      totalTopics,
      totalPages: Math.ceil(totalTopics / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suggestTopics = asyncHandler(async (req, res) => {
  const { pageNum = 1, limitNum = 9 } = req.query;

  try {
    const options = {
      page: parseInt(pageNum, 10),
      limit: parseInt(limitNum, 10)
    };

    const pipeline = [
      {
        $lookup: {
          from: 'topicfollows',
          let: { topicId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Match current user as following user
                    { $eq: ['$topic_id', '$$topicId'] } // Match topic in topics collection with followed topic in topicfollows collection
                  ]
                }
              }
            }
          ],
          as: 'followedTopics'
        }
      },
      {
        $match: {
          followedTopics: { $size: 0 } // Exclude topics already followed by the requesting user
        }
      },
      {
        $skip: (options.page - 1) * options.limit // Skip records based on pagination
      },
      {
        $limit: options.limit // Limit the number of records based on pagination
      },
      {
        $project: {
          followedTopics: 0 // Exclude followedTopics field from result
        }
      },
      
    ];

    const suggestedTopics = await Topic.aggregate(pipeline);

    res.status(200).json({ success: true, message: 'Suggested topics fetched successfully',  data : suggestedTopics });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error fetching suggested topics.', error);
  }
});

const followTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.body;
  const userId = req.user._id;


  try {
    // Check if the user is already following the topic
    const existingFollow = await TopicFollow.findOne({
      user_id: userId,
      topic_id: topicId
    });

    if (existingFollow) {
      res.status(400)
      throw new Error('User is already following this topic')
    }

    // Create a new follow record
    const newFollow = new TopicFollow({
      user_id: userId,
      topic_id: topicId
    });

    await newFollow.save();

    res.status(201).json({ success: true, message: 'Topic followed successfully', data: newFollow });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error following the topic.', error);
  }
});

const unfollowTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.body;
  const userId = req.user._id;

  try {
    // Check if the user is following the topic
    const existingFollow = await TopicFollow.findOne({
      user_id: userId,
      topic_id: topicId
    });

    if (!existingFollow) {
      res.status(400)
      throw new Error('User is not following this topic')
    }

    // Remove the follow record
    await existingFollow.deleteOne();

    res.status(200).json({ success: true, message: 'Topic unfollowed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500)
    throw new Error(`Error unfollowing the topic : ${error.message}`)
  }
});

const getFollowingTopics = asyncHandler(async (req, res) => {
  const { pageNum = 1, limitNum = 9 } = req.query;

  try {
    const options = {
      page: parseInt(pageNum, 10),
      limit: parseInt(limitNum, 10)
    };

    const pipeline = [
      {
        $lookup: {
          from: 'topicfollows',
          let: { topicId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Match current user as following user
                    { $eq: ['$topic_id', '$$topicId'] } // Match topic in topics collection with followed topic in topicfollows collection
                  ]
                }
              }
            }
          ],
          as: 'followedTopics'
        }
      },
      {
        $match: {
          followedTopics: { $not: { $size: 0 } } // Only include topics followed by the requesting user
        }
      },
      {
        $skip: (options.page - 1) * options.limit // Skip records based on pagination
      },
      {
        $limit: options.limit // Limit the number of records based on pagination
      },
      {
        $project: {
          followedTopics: 0 // Exclude followedTopics field from result
        }
      }
    ];

    const followingTopics = await Topic.aggregate(pipeline);

    res.status(200).json({ success: true, message: 'Following topics fetched successfully', data: followingTopics });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error fetching following topics.', error);
  }
});


const getTopicDetails = asyncHandler(async (req, res) => {
  const { topicId } = req.query;

  try {
    const topicDetails = await Topic.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(topicId) }
      },
      {
        $lookup: {
          from: 'topicfollows',
          let: { topicId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$topic_id', '$$topicId']
                }
              }
            }
          ],
          as: 'followers'
        }
      },
      {
        $lookup: {
          from: 'topicfollows',
          let: { topicId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Match current user as following user
                    { $eq: ['$topic_id', '$$topicId'] } // Match topic in topics collection with followed topic in topicfollows collection
                  ]
                }
              }
            }
          ],
          as: 'currentUserFollow'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          followersCount: { $size: '$followers' },
          isFollowing: { $gt: [{ $size: '$currentUserFollow' }, 0] },
        }
      }
    ]);

    if (topicDetails.length === 0) {
      res.status(404)
      throw new Error('Topic not found');
    }

    res.status(200).json({ success: true, message: 'Topic details fetched successfully', data: topicDetails[0] });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error fetching topic details.', error);
  }
});


const getTopicsSuggestionsForHome = asyncHandler( async (req, res) => {
  try {
    const userId = req.user._id;
    const limit =  5; // Set a default limit if not provided

    // Aggregate to find the most followed topics not followed by the current user
    const topics = await TopicFollow.aggregate([
      {
        $facet: {
          followedTopics: [
            { $match: { user_id: userId } },
            { $group: { _id: '$topic_id' } },
            { $project: { _id: 1 } }
          ],
          topicFollowers: [
            { $group: { _id: '$topic_id', followerCount: { $sum: 1 } } },
            { $sort: { followerCount: -1 } },
            { $limit: limit }
          ]
        }
      },
      {
        $project: {
          followedTopicIds: { $map: { input: '$followedTopics', as: 'ft', in: '$$ft._id' } },
          topicFollowers: 1
        }
      },
      {
        $project: {
          topicFollowers: {
            $filter: {
              input: '$topicFollowers',
              as: 'tf',
              cond: { $not: { $in: ['$$tf._id', '$followedTopicIds'] } }
            }
          }
        }
      },
      { $unwind: '$topicFollowers' },
      {
        $lookup: {
          from: 'topics',
          localField: 'topicFollowers._id',
          foreignField: '_id',
          as: 'topicDetails'
        }
      },
      { $unwind: '$topicDetails' },
      {
        $project: {
          _id: '$topicDetails._id',
          name: '$topicDetails.name',
          description: '$topicDetails.description',
          followerCount: '$topicFollowers.followerCount'
        }
      }
    ]);

    res.status(200).json({success : true, topics});
  } catch (error) {
    console.error(error);
    res.status(500)
    throw new Error(`Server error : ${error.message}`)
  }
})

  module.exports = { 
    createTopic,
    autofillSuggestions,
    getAllTopicsForAdmin,
    suggestTopics,
    followTopic,
    unfollowTopic,
    getFollowingTopics,
    getTopicDetails,
    getTopicsSuggestionsForHome,
    
   };