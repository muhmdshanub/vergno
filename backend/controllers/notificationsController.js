const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/notification')


// @desc    get all unread notifications count
// @route   GET /api/notifications/unread/count
// @access  Private

const unreadCount = asyncHandler( async (req, res) =>{
    const user = req.user;

    try {
        const count = await Notification.countDocuments({ user_id: user._id, read: false });
        
        res.status(200).json({ unreadCount: count });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch unread notifications count' });
    }


})


// @desc    Fetch paginated notifications with enriched metadata and total count
// @route   GET /api/notifications
// @access  Private
const getAllNotifications = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 20 } = req.query;

  try {
    const notifications = await Notification.aggregate([
      { $match: { user_id: user._id } },
      {
        $facet: {
          paginatedResults: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) },
            {
              $lookup: {
                from: 'users', // Collection name of the User model
                let: { accepter_id: '$metadata.accepter_id', requester_id: '$metadata.requester_id', liker_id: '$metadata.liker_id' },
                pipeline: [
                  { $match: { $expr: { $in: ['$_id', ['$$accepter_id', '$$requester_id', '$$liker_id']] } } },
                  { $project: { name: 1, image: 1, googleProfilePicture: 1 } }
                ],
                as: 'populatedUsers'
              }
            },
            {
              $lookup: {
                from: 'queries', // Collection name of the Query model
                let: { query_id: '$metadata.query_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$query_id'] } } },
                  { $project: { title: 1 } }
                ],
                as: 'populatedQueries'
              }
            },
            {
              $lookup: {
                from: 'perspectives', // Collection name of the Perspective model
                let: { perspective_id: '$metadata.perspective_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$perspective_id'] } } },
                  { $project: { title: 1 } }
                ],
                as: 'populatedPerspectives'
              }
            },
            {
              $unwind: {
                path: '$populatedUsers',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: '$populatedQueries',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: '$populatedPerspectives',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                user_id: 1,
                type: 1,
                message: 1,
                metadata: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$type', 'follow_request_accepted'] }, then: { accepter: '$populatedUsers' } },
                      { case: { $eq: ['$type', 'follow_request'] }, then: { requester: '$populatedUsers' } },
                      { case: { $eq: ['$type', 'query_like'] }, then: { query: '$populatedQueries', liker: '$populatedUsers' } },
                      { case: { $eq: ['$type', 'perspective_like'] }, then: { perspective: '$populatedPerspectives', liker: '$populatedUsers' } }
                      // Add more cases as needed for other notification types
                    ],
                    default: '$metadata'
                  }
                },
                read: 1,
                createdAt: 1
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          paginatedResults: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] }
        }
      }
    ]);

    

    res.status(200).json({
      notifications: notifications[0].paginatedResults,
      totalCount: notifications[0].totalCount || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});



const markAsRead = asyncHandler( async (req, res) =>{
  const user = req.user;
  const {notification_id} = req.body;


  try {
      // Find the notification by ID and user ID
    const notification = await Notification.findOneAndUpdate(
      { _id: notification_id, user_id: user._id },
      { read: true },
    );

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    res.status(200).json({ message: 'Notification marked as read' });

  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch teh notification' });
  }


})


module.exports = {
    unreadCount,
    getAllNotifications,
    markAsRead,
};
