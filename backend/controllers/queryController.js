const asyncHandler = require('express-async-handler');
const mongoose = require("mongoose");
const User = require('../models/user');
const Query = require('../models/query');
const QueryLike = require('../models/queryLike')
const Notification = require('../models/notification')
const QueryComment = require('../models/queryComment');
const ReportPost = require('../models/reportPost');
const QueryCommentLike = require('../models/queryCommentLike')
const ReportComment = require('../models/reportComment')

const addQueryToProfile = asyncHandler (async (req, res) =>{

    
    console.log("reached here")

    const user = req.user;
    const { title, description, topic } = req.body;
    let url;
    let public_id;

    if (req?.file?.path && req?.file?.filename) {
        url = req.file.path;
        public_id = req.file.filename;
    }


    // Validate the form data
    if (!title || !description || !topic) {
        res.status(400);
        throw new Error('Title, description, and topic are required.' );
    }

    // Check if the topic is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(topic)) {
        res.status(400);
        throw new Error('Invalid topic ID.' );
    }

     // Function to validate title format (only letters, numbers, spaces, and special characters, max 50)
  const isValidTitle = (title) => {
    return /^[a-zA-Z0-9\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{1,50}$/.test(title);
  };

  // Function to validate description length (max 1000 characters)
  const isValidDescription = (description) => {
    return description.length <= 1000;
  };

 

  if(!isValidDescription(description)){
    res.status(400);
        throw new Error('Invalid description' );
  }

  if(!isValidTitle(title)){
    res.status(400);
        throw new Error('Invalid title' );
  }

    try {
        // Create a new query
        const newQuery = new Query({
            user: user._id,
            title,
            description,
            topic,
        });

        if (url && public_id) {
            newQuery.image = {
                url,
                public_id
            };
        }

        // Save the query to the database
        const result = await newQuery.save();


        
        // Send a success response
        res.status(201).json({ message: 'Query added successfully.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }


})



const likeQuery = asyncHandler(async (req, res) => {
    
  // Ensure userId and queryId are ObjectId
const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
const queryId = mongoose.Types.ObjectId.isValid(req.body.queryId) ? new mongoose.Types.ObjectId(req.body.queryId) : null;

// Validate ObjectId format
if (!userId || !queryId) {
  res.status(400);
  throw new Error('Invalid user ID or query ID');
}
  
    // Check if the like already exists
    const existingLike = await QueryLike.findOne({ query_id: queryId, user_id: userId });
    if (existingLike) {
      res.status(400);
      throw new Error('Query already liked');
    }
  
    const newLike = new QueryLike({
      query_id: queryId,
      user_id: userId,
    });
  
    await newLike.save();
  
    // Increment the likeCount
    const queryData = await Query.findByIdAndUpdate(queryId, { $inc: { likeCount: 1 } });

    // Create a notification for the query owner
    const notification = new Notification({
        user_id: queryData.user, // The user who receives the notification
        type: 'query_like',
        message: 'Your query has a new like',
        metadata: {
        liker_id: userId,
        query_id: queryData._id
        }
    });

    await notification.save();

    // Emit Socket.io event to notify the query owner
    req.io.to(`${queryData.user}`).emit('new_query_like', (acknowledgment) => {
        if (acknowledgment) {
        console.log(`Notification sent to user ${queryData.user} successfully`);
        } else {
        console.error(`Failed to send notification to user ${queryData.user}`);
        }
    });

  
    res.status(201).json({ message: 'Query liked successfully' });
  });
  
  const unlikeQuery = asyncHandler(async (req, res) => {
      // Ensure userId and queryId are ObjectId
const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
const queryId = mongoose.Types.ObjectId.isValid(req.body.queryId) ? new mongoose.Types.ObjectId(req.body.queryId) : null;

// Validate ObjectId format
if (!userId || !queryId) {
  res.status(400);
  throw new Error('Invalid user ID or query ID');
}
  
    // Check if the like exists
    const existingLike = await QueryLike.findOne({ query_id: queryId, user_id: userId });
  
    if (!existingLike) {
      res.status(400);
      throw new Error('Query not liked yet');
    }
  
    await existingLike.deleteOne();
  
    // Decrement the likeCount
    await Query.findByIdAndUpdate(queryId, { $inc: { likeCount: -1 } });
  
    res.status(200).json({ message: 'Query unliked successfully' });
  });

const getAllQueryDetailsForAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'latest', filterBy = 'default' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Define sorting criteria
    let sortCriteria = { posted_at: -1 }; // Default sorting by latest
    if (sortBy === 'oldest') {
        sortCriteria = { posted_at: 1 }; // Sort by oldest first
    }

    // Define match criteria for filtering
    let matchCriteria = {};
    if (filterBy === 'blocked') {
        matchCriteria.isBlocked = true;
    }

    const queries = await Query.aggregate([
        {
            $match: matchCriteria,
        },
        {
            $facet: {
                paginatedResults: [
                    {
                        $sort: sortCriteria,
                    },
                    {
                        $skip: skipNum,
                    },
                    {
                        $limit: 10,
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'userDetails',
                        },
                    },
                    {
                        $lookup: {
                            from: 'topics',
                            localField: 'topic',
                            foreignField: '_id',
                            as: 'topicDetails',
                        },
                    },
                    {
                        $lookup: {
                            from: 'querycomments',
                            localField: '_id',
                            foreignField: 'parent_query',
                            as: 'comments',
                        },
                    },
                    {
                        $lookup: {
                            from: 'reportposts',
                            let: { queryId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$post_id', '$$queryId'] },
                                                { $eq: ['$post_type', 'query'] },
                                                { $eq: ['$post_source', 'user_profile'] },
                                            ],
                                        },
                                    },
                                },
                                {
                                    $count: 'totalReports',
                                },
                            ],
                            as: 'reportDetails',
                        },
                    },
                    {
                        $addFields: {
                            userName: { $arrayElemAt: ['$userDetails.name', 0] },
                            topicName: { $arrayElemAt: ['$topicDetails.name', 0] },
                            totalComments: { $size: '$comments' },
                            totalReports: { $ifNull: [{ $arrayElemAt: ['$reportDetails.totalReports', 0] }, 0] },
                        },
                    },
                    {
                        $project: {
                            userDetails: 0,
                            topicDetails: 0,
                            comments: 0,
                            reportDetails: 0,
                        },
                    },
                ],
                totalCount: [
                    {
                        $count: 'count',
                    },
                ],
            },
        },
        {
            $project: {
                paginatedResults: 1,
                totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
            },
        },
    ]);

    

    res.status(200).json({
        success: true,
        queries: queries[0].paginatedResults,
        totalCount: queries[0].totalCount || 0, // Handle cases where totalCount is undefined
    });
});

const blockQueryFromAdmin = asyncHandler(async (req, res) => {
  const { queryId } = req.body;
  

 

  try {
      const query = await Query.findById(queryId);

      if (!query) {
          res.status(404);
          throw new Error('Query not found');
      }

      if (query.isBlocked) {
          res.status(400);
          throw new Error('Query is already blocked');
      }

      query.isBlocked = true;
      await query.save();

      res.status(200).json({
          success: true,
          message: 'Query blocked successfully',
      });
  } catch (error) {
      console.error('Failed to block query:', error);
      res.status(500);
      throw new Error('Failed to block query');
  }
});




const unblockQueryFromAdmin = asyncHandler(async (req, res) => {
  const { queryId } = req.body;

 

  try {
      const query = await Query.findById(queryId);

      if (!query) {
          res.status(404);
          throw new Error('Query not found');
      }

      if (!query.isBlocked) {
          res.status(400);
          throw new Error('Query is already unblocked');
      }

      // Unblock the query
      query.isBlocked = false;
      await query.save();

      // Delete all reports for this query
      await ReportPost.deleteMany({ post_id: queryId, post_type: 'query' });

      res.status(200).json({
          success: true,
          message: 'Query unblocked and reports deleted successfully',
      });
  } catch (error) {
      console.error('Failed to unblock query:', error);
      res.status(500);
      throw new Error('Failed to unblock query');
  }
});

const deleteQueryFromAdmin = asyncHandler(async (req, res) => {
  const { queryId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(queryId)) {
      res.status(400);
      throw new Error('Invalid query ID');
  }

  try {
      const query = await Query.findById(queryId);

      if (!query) {
          res.status(404);
          throw new Error('Query not found');
      }

      // Delete the query
      await Query.findByIdAndDelete(queryId);

      // Delete all query likes associated with the query
      await QueryLike.deleteMany({ query_id: queryId });

      // Find all query comments associated with the query
      const queryComments = await QueryComment.find({ parent_query: queryId });

      // Delete all query comments associated with the query
      await QueryComment.deleteMany({ parent_query: queryId });

      // Delete all query comment likes associated with the query comments
      const commentIds = queryComments.map(comment => comment._id);
      await QueryCommentLike.deleteMany({ comment_id: { $in: commentIds } });

      // Delete all reports associated with the query comments
      await ReportComment.deleteMany({ comment_id: { $in: commentIds }, comment_type: 'queryComment' });

      // Delete all reports associated with the query
      await ReportPost.deleteMany({ post_id: queryId, post_type: 'query' });

      res.status(200).json({
          success: true,
          message: 'Query and related data deleted successfully',
      });
  } catch (error) {
      console.error('Failed to delete query:', error);
      res.status(500);
      throw new Error('Failed to delete query');
  }
});


const getSingleQueryDetailsForAdmin = asyncHandler(async (req, res) => {
  const { queryId } = req.query; // Assuming queryId is passed as a route parameter

  try {
    const pipeline = [
      // Match stage to find the query by ID
      {
        $match: { _id: new mongoose.Types.ObjectId(queryId) }
      },
      // Lookup stage to fetch user details
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      // Unwind user array (assuming one-to-one relationship)
      {
        $unwind: '$user'
      },
      // Lookup stage to fetch topic details
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic'
        }
      },
      // Unwind topic array (assuming one-to-one relationship)
      {
        $unwind: '$topic'
      },
      // Project stage to shape the output document
      {
        $project: {
          _id: 1,
          userInfo: {
            _id: '$user._id',
            name: '$user.name',
            image: '$user.image',
            googleProfilePicture: '$user.googleProfilePicture'
          },
          title: 1,
          image: 1,
          description: 1,
          topic: {
            _id: '$topic._id',
            name: '$topic.name',
            // Include other topic details as needed
          },
          likeCount: 1,
          commentCount: 1,
          posted_at: 1,
          isResolved: 1,
          isBlocked: 1,
        }
      }
    ];

    // Execute the aggregation pipeline
    const queryDetails = await Query.aggregate(pipeline);

    if (!queryDetails || queryDetails.length === 0) {
      res.status(404)
      throw new Error('Error fetching reports for query')
    }

    // Return the first document (assuming only one document matches the ID)
    res.status(200).json({ success: true, query: queryDetails[0] });
  } catch (error) {
    console.error('Error fetching query details for admin:');
    res.status(500)
    throw new Error('Failed to fetch query details:')
  }
});



const getAllReportsForSingleQueryAdmin = asyncHandler(async (req, res) => {
  
  const { queryId, pageNum = 1, limitNum = 10 } = req.query;

  // Validate queryId if needed
  if (!queryId) {
    res.status(400)
    throw new Error('Query ID is required')
    
  }

  try {
    const pipeline = [
      // Match stage to filter reports by queryId
      {
        $match: { post_id: new mongoose.Types.ObjectId(queryId) }
      },
      // Facet stage to calculate total count and fetch paginated results
      {
        $facet: {
          // Branch to calculate total count
          metadata: [
            { $count: 'total' }
          ],
          // Branch to fetch paginated results
          data: [
            // Sorting by created_at in descending order
            {
              $sort: { created_at: -1 }
            },
            // Pagination using skip and limit
            {
              $skip: (parseInt(pageNum, 10) - 1) * parseInt(limitNum, 10)
            },
            {
              $limit: parseInt(limitNum, 10)
            },
            // Lookup stage to fetch reporter details from User collection
            {
              $lookup: {
                from: 'users',
                localField: 'reporter_id',
                foreignField: '_id',
                as: 'reporter'
              }
            },
            // Unwind the reporter array (assuming one-to-one relationship)
            {
              $unwind: '$reporter'
            },
            // Project stage to shape the output document
            {
              $project: {
                _id: 1,
                reporter_id: '$reporter._id',
                reporter_name: '$reporter.name',
                reason: 1,
                post_type: 1,
                post_source: 1,
                post_id: 1,
                created_at: 1
              }
            }
          ]
        }
      }
    ];

    // Execute the aggregation pipeline
    const results = await ReportPost.aggregate(pipeline);

    // Extracting total count and paginated results
    const totalCount = results[0]?.metadata[0]?.total || 0;
    const reports = results[0]?.data || [];


    
    res.status(200).json({
      success: true,
      totalCount,
      reports
    });
  } catch (error) {
    console.error('Error in fetching reports:', error);
    res.status(500)
    throw new Error('Failed to fetch reports', error.message );
  }

})


const getAllReportsForAllQueriesAdmin = asyncHandler(async (req, res) => {
  

  const { pageNum = 1, limitNum = 10 } = req.query;

  try {
    const pipeline = [
      // Match stage to filter reports by post_type and post_source
      {
        $match: {
          post_type: 'query',
          post_source: 'user_profile'
        }
      },
      // Facet stage to calculate total count and fetch paginated results
      {
        $facet: {
          // Branch to calculate total count
          metadata: [
            { $count: 'total' }
          ],
          // Branch to fetch paginated results
          data: [
            // Sorting by created_at in descending order
            {
              $sort: { created_at: -1 }
            },
            // Pagination using skip and limit
            {
              $skip: (parseInt(pageNum, 10) - 1) * parseInt(limitNum, 10)
            },
            {
              $limit: parseInt(limitNum, 10)
            },
            // Lookup stage to fetch reporter details from User collection
            {
              $lookup: {
                from: 'users',
                localField: 'reporter_id',
                foreignField: '_id',
                as: 'reporter'
              }
            },
            // Unwind the reporter array (assuming one-to-one relationship)
            {
              $unwind: '$reporter'
            },
            // Project stage to shape the output document
            {
              $project: {
                _id: 1,
                reporter_id: '$reporter._id',
                reporter_name: '$reporter.name',
                reason: 1,
                post_type: 1,
                post_source: 1,
                post_id: 1,
                created_at: 1
              }
            }
          ]
        }
      }
    ];

    // Execute the aggregation pipeline
    const results = await ReportPost.aggregate(pipeline);

    // Extracting total count and paginated results
    const totalCount = results[0]?.metadata[0]?.total || 0;
    const reports = results[0]?.data || [];

    res.status(200).json({
      success: true,
      totalCount,
      reports
    });
  } catch (error) {
    console.error('Error in fetching reports:', error);
    res.status(500)
    throw new Error('Failed to fetch reports', error.message);
  }
});

const globalSearchQueries = asyncHandler(async (req, res) => {
  const { searchBy = '', page = 1, limit = 10 } = req.query;

  try {
    const aggregateQuery = [
      // Initial match to filter out blocked queries and queries that do not match the search criteria
      {
        $match: {
          isBlocked: false,
          $or: [
            { title: { $regex: searchBy, $options: 'i' } },
            { description: { $regex: searchBy, $options: 'i' } },
          ],
        },
      },
      // Lookup to get user data, only for queries that passed the initial filter
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_data',
          pipeline: [
            {
              $match: {
                isBlocked: false, // Ensure that the user is not blocked
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user_data',
          preserveNullAndEmptyArrays: false, // Only include documents where user_data exists
        },
      },
      // Lookup to get topic data
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic_data',
        },
      },
      {
        $unwind: {
          path: '$topic_data',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup to check if the query is liked by the current user
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
                    { $eq: ['$user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Assuming the user ID is available in req.user
                  ],
                },
              },
            },
          ],
          as: 'user_like',
        },
      },
      // Lookup to check if the query is saved by the current user
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
                    { $eq: ['$user', new mongoose.Types.ObjectId(req.user._id)] }, // Assuming the user ID is available in req.user
                  ],
                },
              },
            },
          ],
          as: 'post_save',
        },
      },
      {
        $facet: {
          queries: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit, 10) },
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
                topic: '$topic_data.name',
                posted_at: 1,
                isResolved: 1,
                isBlocked: 1,
                post_type: { $literal: 'queries' },
                post_source: { $literal: 'from_all' },
                isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
                isPostSaved: { $cond: { if: { $gt: [{ $size: '$post_save' }, 0] }, then: true, else: false } },
                savedPostId: { $arrayElemAt: ['$post_save._id', 0] },
              },
            },
          ],
          totalCount: [
            {
              $count: 'total',
            },
          ],
        },
      },
    ];

    const result = await Query.aggregate(aggregateQuery);

    const queries = result[0].queries;
    const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].total : 0;

    res.json({
      success: true,
      queries,
      total,
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500)
    throw new Error(`Error fetching queries: ${error.message}`)
  }
});

module.exports = {
    addQueryToProfile,
    likeQuery,
    unlikeQuery,
    getAllQueryDetailsForAdmin,
    unblockQueryFromAdmin,
    blockQueryFromAdmin,
    deleteQueryFromAdmin,
    getSingleQueryDetailsForAdmin,
    getSingleQueryDetailsForAdmin,
    getAllReportsForSingleQueryAdmin,
    getAllReportsForAllQueriesAdmin,
    globalSearchQueries,

}