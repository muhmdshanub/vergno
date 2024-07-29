const asyncHandler = require('express-async-handler');
const mongoose = require("mongoose");
const User = require('../models/user');
const Perspective = require('../models/perspective');
const PerspectiveLike = require('../models/perspectiveLike')
const Notification = require('../models/notification')
const Topic = require('../models/topic');
const PerspectiveComment = require('../models/perspectiveComment');
const ReportPost = require('../models/reportPost');
const PerspectiveCommentLike = require('../models/perspectiveCommentLike');
const ReportComment = require('../models/reportComment');


const addPerspectiveToProfile = asyncHandler (async (req, res) =>{
    const user = req.user;
    const { title, description, topic } = req.body;
    let url;
    let public_id;

    if (req?.file?.path && req?.file?.filename) {
        url = req.file.path;
        public_id = req.file.filename;
    }


    try {
        // Create a new Perspective
        const newPerspective = new Perspective({
            user: user._id,
            title,
            description,
            topic,
        });

        if (url && public_id) {
            newPerspective.image = {
                url,
                public_id
            };
        }

        // Save the Perspective to the database
        const result = await newPerspective.save();


        
        // Send a success response
        res.status(201).json({ message: 'Perspective added successfully.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }


})

const likePerspective = asyncHandler(async (req, res) => {


   // Ensure userId and queryId are ObjectId
const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
const perspectiveId = mongoose.Types.ObjectId.isValid(req.body.perspectiveId) ? (new mongoose.Types.ObjectId(req.body.perspectiveId)) : null;

// Validate ObjectId format
if (!userId || !perspectiveId) {
  res.status(400);
  throw new Error('Invalid user ID or query ID');
}

  // Check if the like already exists
  const existingLike = await PerspectiveLike.findOne({ perspective_id: perspectiveId, user_id: userId });
  if (existingLike) {
    res.status(400);
    throw new Error('Perspective already liked');
  }

  const newLike = new PerspectiveLike({
    perspective_id: perspectiveId,
    user_id: userId,
  });

  await newLike.save();

  // Increment the likeCount
  const perspectiveData = await Perspective.findByIdAndUpdate(perspectiveId, { $inc: { likeCount: 1 } });

  // Create a notification for the perspective owner
  const notification = new Notification({
    user_id: perspectiveData.user, // The user who receives the notification
    type: 'perspective_like',
    message: 'Your perspective has a new like',
    metadata: {
    liker_id: userId,
    perspective_id: perspectiveId
    }
});

await notification.save();

// Emit Socket.io event to notify the perspective owner
req.io.to(`${perspectiveData.user}`).emit('new_perspective_like', (acknowledgment) => {
    if (acknowledgment) {
    console.log(`Notification sent to user ${perspectiveData.user} successfully`);
    } else {
    console.error(`Failed to send notification to user ${perspectiveData.user}`);
    }
});

  res.status(201).json({ message: 'Perspective liked successfully' });
});

const unlikePerspective = asyncHandler(async (req, res) => {
  
  // Ensure userId and queryId are ObjectId
const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
const perspectiveId = mongoose.Types.ObjectId.isValid(req.body.perspectiveId) ? new mongoose.Types.ObjectId(req.body.perspectiveId) : null;

// Validate ObjectId format
if (!userId || !perspectiveId) {
  res.status(400);
  throw new Error('Invalid user ID or query ID');
}


  // Check if the like exists
  const existingLike = await PerspectiveLike.findOne({ perspective_id: perspectiveId, user_id: userId });

  if (!existingLike) {
    res.status(400);
    throw new Error('Perspective not liked yet');
  }

  await existingLike.deleteOne();

  // Decrement the likeCount
  await Perspective.findByIdAndUpdate(perspectiveId, { $inc: { likeCount: -1 } });

  res.status(200).json({ message: 'Perspective unliked successfully' });
});


const getAllPerspectiveDetailsForAdmin = asyncHandler(async (req, res) => {
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

  const perspectives = await Perspective.aggregate([
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
                      $limit: limitNum,
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
                          from: 'perspectivecomments',
                          localField: '_id',
                          foreignField: 'parent_perspective',
                          as: 'comments',
                      },
                  },
                  {
                      $lookup: {
                          from: 'reportposts',
                          let: { perspectiveId: '$_id' },
                          pipeline: [
                              {
                                  $match: {
                                      $expr: {
                                          $and: [
                                              { $eq: ['$post_id', '$$perspectiveId'] },
                                              { $eq: ['$post_type', 'perspective'] },
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
      perspectives: perspectives[0].paginatedResults,
      totalCount: perspectives[0].totalCount || 0, // Handle cases where totalCount is undefined
  });
});

const blockPerspectiveFromAdmin = asyncHandler(async (req, res) => {
  const { perspectiveId } = req.body;



  try {
    const perspective = await Perspective.findById(perspectiveId);

    if (!perspective) {
      res.status(404);
      throw new Error('Perspective not found');
    }

    if (perspective.isBlocked) {
      res.status(400);
      throw new Error('Perspective is already blocked');
    }

    perspective.isBlocked = true;
    await perspective.save();

    res.status(200).json({
      success: true,
      message: 'Perspective blocked successfully',
    });
  } catch (error) {
    console.error('Failed to block perspective:', error);
    res.status(500);
    throw new Error('Failed to block perspective');
  }
});


const unblockPerspectiveFromAdmin = asyncHandler(async (req, res) => {
  const { perspectiveId } = req.body;

  

  try {
    const perspective = await Perspective.findById(perspectiveId);

    if (!perspective) {
      res.status(404);
      throw new Error('Perspective not found');
    }

    if (!perspective.isBlocked) {
      res.status(400);
      throw new Error('Perspective is already unblocked');
    }

    // Unblock the perspective
    perspective.isBlocked = false;
    await perspective.save();

    // Delete all reports for this perspective
    await ReportPost.deleteMany({ post_id: perspectiveId, post_type: 'perspective' });

    res.status(200).json({
      success: true,
      message: 'Perspective unblocked and reports deleted successfully',
    });
  } catch (error) {
    console.error('Failed to unblock perspective:', error);
    res.status(500);
    throw new Error('Failed to unblock perspective');
  }
});

const deletePerspectiveFromAdmin = asyncHandler(async (req, res) => {
  const { perspectiveId } = req.body;

  

  try {
    const perspective = await Perspective.findById(perspectiveId);

    if (!perspective) {
      res.status(404);
      throw new Error('Perspective not found');
    }

    // Delete the perspective
    await Perspective.findByIdAndDelete(perspectiveId);

    // Delete all likes associated with the perspective
    await PerspectiveLike.deleteMany({ perspective_id: perspectiveId });

    // Find all comments associated with the perspective
    const perspectiveComments = await PerspectiveComment.find({ parent_perspective: perspectiveId });

    // Delete all comments associated with the perspective
    await PerspectiveComment.deleteMany({ parent_perspective: perspectiveId });

    // Delete all comment likes associated with the perspective comments
    const commentIds = perspectiveComments.map(comment => comment._id);
    await PerspectiveCommentLike.deleteMany({ comment_id: { $in: commentIds } });

    // Delete all reports associated with the perspective comments
    await ReportComment.deleteMany({ comment_id: { $in: commentIds }, comment_type: 'perspectiveComment' });

    // Delete all reports associated with the perspective
    await ReportPost.deleteMany({ post_id: perspectiveId, post_type: 'perspective' });

    res.status(200).json({
      success: true,
      message: 'Perspective and related data deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete perspective:', error);
    res.status(500);
    throw new Error('Failed to delete perspective');
  }
});

const getSinglePerspectiveDetailsForAdmin = asyncHandler(async (req, res) => {
  const { perspectiveId } = req.query; // Assuming perspectiveId is passed as a query parameter

  try {
    const pipeline = [
      // Match stage to find the perspective by ID
      {
        $match: { _id: new mongoose.Types.ObjectId(perspectiveId) }
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
          isBlocked: 1,
        }
      }
    ];

    // Execute the aggregation pipeline
    const perspectiveDetails = await Perspective.aggregate(pipeline);

    if (!perspectiveDetails || perspectiveDetails.length === 0) {
      res.status(404);
      throw new Error('Perspective not found');
    }

    // Return the first document (assuming only one document matches the ID)
    res.status(200).json({ success: true, perspective: perspectiveDetails[0] });
  } catch (error) {
    console.error('Error fetching perspective details for admin:', error);
    res.status(500);
    throw new Error('Failed to fetch perspective details');
  }
});

const getAllReportsForSinglePerspectiveAdmin = asyncHandler(async (req, res) => {
  const { perspectiveId, pageNum = 1, limitNum = 10 } = req.query;

  try {
    const pipeline = [
      // Match stage to filter reports by perspectiveId
      {
        $match: { post_id: new mongoose.Types.ObjectId(perspectiveId) }
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
    res.status(500);
    throw new Error('Failed to fetch reports');
  }
});

const getAllReportsForAllPerspectivesAdmin = asyncHandler(async (req, res) => {
  

  const { pageNum = 1, limitNum = 10 } = req.query;

  try {
    const pipeline = [
      // Match stage to filter reports by post_type and post_source
      {
        $match: {
          post_type: 'perspective',
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
    res.status(500);
    throw new Error('Failed to fetch reports');
  }
})

// const globalSearchPerspectives = asyncHandler(async (req, res) => {
//   const { searchBy = '', page = 1, limit = 10 } = req.query;

//   try {
//     const aggregatePerspective = [
//       // Initial match to filter out blocked perspectivess and perspectivess that do not match the search criteria
//       {
//         $match: {
//           isBlocked: false,
//           $or: [
//             { title: { $regex: searchBy, $options: 'i' } },
//             { description: { $regex: searchBy, $options: 'i' } },
//           ],
//         },
//       },
//       // Lookup to get user data, only for perspectivess that passed the initial filter
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'user',
//           foreignField: '_id',
//           as: 'user_data',
//           pipeline: [
//             {
//               $match: {
//                 isBlocked: false, // Ensure that the user is not blocked
//               },
//             },
//           ],
//         },
//       },
//       {
//         $unwind: {
//           path: '$user_data',
//           preserveNullAndEmptyArrays: false, // Only include documents where user_data exists
//         },
//       },
//       // Lookup to get topic data
//       {
//         $lookup: {
//           from: 'topics',
//           localField: 'topic',
//           foreignField: '_id',
//           as: 'topic_data',
//         },
//       },
//       {
//         $unwind: {
//           path: '$topic_data',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // Lookup to check if the perspectives is liked by the current user
//       {
//         $lookup: {
//           from: 'perspectivelikes',
//           let: { perspectiveId: '$_id' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$perspective_id', '$$perspectiveId'] },
//                     { $eq: ['$user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Assuming the user ID is available in req.user
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'user_like',
//         },
//       },
//       // Lookup to check if the perspective is saved by the current user
//       {
//         $lookup: {
//           from: 'postsaves',
//           let: { perspectiveId: '$_id' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$post', '$$perspectiveId'] },
//                     { $eq: ['$user', new mongoose.Types.ObjectId(req.user._id)] }, // Assuming the user ID is available in req.user
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'post_save',
//         },
//       },
//       {
//         $facet: {
//           perspectives: [
//             { $skip: (page - 1) * limit },
//             { $limit: parseInt(limit, 10) },
//             {
//               $project: {
//                 _id: 1,
//                 user: {
//                   _id: { $arrayElemAt: ['$user_data._id', 0] },
//                   name: { $arrayElemAt: ['$user_data.name', 0] },
//                   image: { $arrayElemAt: ['$user_data.image', 0] },
//                   googleProfilePicture: { $arrayElemAt: ['$user_data.googleProfilePicture', 0] },
//                 },
//                 title: 1,
//                 image: 1,
//                 description: 1,
//                 likeCount: 1,
//                 commentCount: 1,
//                 answerCount: 1,
//                 topic: { $arrayElemAt: ['$topic_data.name', 0] },
//                 posted_at: 1,
//                 isResolved: 1,
//                 isBlocked: 1,
//                 post_type: { $literal: 'perspectives' },
//                 post_source: { $literal: 'from_all' },
//                 isLikedByUser: { $cond: { if: { $gt: [{ $size: '$user_like' }, 0] }, then: true, else: false } },
//                 isPostSaved: { $cond: { if: { $gt: [{ $size: '$post_save' }, 0] }, then: true, else: false } },
//                 savedPostId: { $arrayElemAt: ['$post_save._id', 0] },
//               },
//             },
//           ],
//           totalCount: [
//             {
//               $count: 'total',
//             },
//           ],
//         },
//       },
//     ];

//     const result = await Perspective.aggregate(aggregatePerspective);

//     const perspectives = result[0].perspectives;
//     const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].total : 0;

//     res.json({
//       success: true,
//       perspectives,
//       total,
//       limit: parseInt(limit, 10),
//       page: parseInt(page, 10),
//       pages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     console.error('Error fetching perspectives :', error);
//     res.status(500)
//     throw new Error(`Error fetching perspectives : ${error.message}`)
//   }
// });

const globalSearchPerspectives = asyncHandler(async (req, res) => {
  const { searchBy = '', page = 1, limit = 10 } = req.query;

  try {
    const aggregatePerspective = [
      // Initial match to filter out blocked perspectives and perspectives that do not match the search criteria
      {
        $match: {
          isBlocked: false,
          $or: [
            { title: { $regex: searchBy, $options: 'i' } },
            { description: { $regex: searchBy, $options: 'i' } },
          ],
        },
      },
      // Lookup to get user data, only for perspectives that passed the initial filter
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
      // Lookup to check if the perspective is liked by the current user
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
                    { $eq: ['$user_id', new mongoose.Types.ObjectId(req.user._id)] }, // Assuming the user ID is available in req.user
                  ],
                },
              },
            },
          ],
          as: 'user_like',
        },
      },
      // Lookup to check if the perspective is saved by the current user
      {
        $lookup: {
          from: 'postsaves',
          let: { perspectiveId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$perspectiveId'] },
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
          perspectives: [
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
                topic: '$topic_data.name',
                posted_at: 1,
                isBlocked: 1,
                post_type: { $literal: 'perspectives' },
                post_source: { $literal: 'from_all' },
                isLikedByUser: { $gt: [{ $size: '$user_like' }, 0] },
                isPostSaved: { $gt: [{ $size: '$post_save' }, 0] },
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

    const result = await Perspective.aggregate(aggregatePerspective);

    const perspectives = result[0].perspectives;
    const total = result[0].totalCount.length > 0 ? result[0].totalCount[0].total : 0;

    res.json({
      success: true,
      perspectives,
      total,
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching perspectives :', error);
    res.status(500)
    throw new Error(`Error fetching perspectives : ${error.message}`)
  }
});



module.exports = {
    addPerspectiveToProfile,
    likePerspective,
    unlikePerspective,
    getAllPerspectiveDetailsForAdmin,
    blockPerspectiveFromAdmin,
    unblockPerspectiveFromAdmin,
    deletePerspectiveFromAdmin,
    getSinglePerspectiveDetailsForAdmin,
    getAllReportsForSinglePerspectiveAdmin,
    getAllReportsForAllPerspectivesAdmin,
    globalSearchPerspectives,

}