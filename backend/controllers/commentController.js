const QueryComment = require('../models/queryComment');
const PerspectiveComment = require('../models/perspectiveComment');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { default: mongoose } = require('mongoose');
const Query = require('../models/query');
const Perspective = require('../models/perspective');
const QueryCommentLike = require('../models/queryCommentLike')
const PerspectiveCommentLike = require('../models/perspectiveCommentLike')
const Notification = require('../models/notification')
const ReportComment = require('../models/reportComment')





const queryComment = asyncHandler(async (req, res) =>{

    const {comment_content  } = req.body;

    const commenter_id = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
    const parent_query_id = mongoose.Types.ObjectId.isValid(req.body.parent_query_id) ? (new mongoose.Types.ObjectId(req.body.parent_query_id)) : null;
    
    const parentQuery = await Query.findById(parent_query_id);

    if (!parentQuery) {
        
        res.status(404)
        throw new Error(' Query not found');
        
    }

    try{
        // Create a new query comment
        const newComment = new QueryComment({
            commented_by: commenter_id,
            parent_query : parent_query_id,
            comment_content,
         });

         // Save the new comment to the database
        const createdComment = await newComment.save();

         // Increment the comment count of the parent query atomically
         await Query.findByIdAndUpdate(parent_query_id, { $inc: { commentCount: 1 } });

          // Fetch the newly created comment with additional data
        const commentData = await QueryComment.aggregate([
            {
                $match: {
                    _id: createdComment._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'querycommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', commenter_id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', commenter_id] },
                            { $eq: [parentQuery.user, commenter_id] }
                        ]
                    }
                }
            },
            {
                $project: {
                    likes: 0,
                    commenter: 0,
                }
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: commentData[0] // Return the enriched comment data
        });

    }catch(error){
        res.status(500);
        throw new Error('Failed to add comment.', error);
    }

})


const queryReply = asyncHandler(async (req, res) =>{

    const {comment_content  } = req.body;

    const commenter_id = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
    const parent_query_id = mongoose.Types.ObjectId.isValid(req.body.parent_query_id) ? (new mongoose.Types.ObjectId(req.body.parent_query_id)) : null;
    const parent_comment_id = mongoose.Types.ObjectId.isValid(req.body.parent_comment_id) ? (new mongoose.Types.ObjectId(req.body.parent_comment_id)) : null;


    const parentQuery = await Query.findById(parent_query_id);
    const parentComment = await QueryComment.findById(parent_comment_id)

    if ( !parentQuery || !parentComment) {
        
        res.status(404)
        throw new Error('User or Query or parent Comment not found');
    }



    try{
        // Create a new query comment
        const newComment = new QueryComment({
            commented_by: commenter_id,
            parent_query : parent_query_id,
            is_reply: true,
            parent_comment : parent_comment_id,
            comment_content,
         });

         // Save the new comment to the database
        const createdReply = await newComment.save();

         // Increment the comment count of the parent query atomically
         await QueryComment.findByIdAndUpdate(parent_comment_id, { $inc: { reply_count: 1 } });

         // Fetch the newly created reply with additional data
        const replyData = await QueryComment.aggregate([
            {
                $match: {
                    _id: createdReply._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'querycommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', commenter_id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {  
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', commenter_id] },
                            { $eq: ['$parentQuery.user', commenter_id] },
                            { $eq: ['$parentComment.commented_by', commenter_id] }
                        ]
                    }    
                }
            },
            {
                $project: {
                    likes: 0,
                    commenter: 0
                }
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            comment: replyData[0] // Return the enriched reply data
        });

    }catch(error){
        console.log(error)
        res.status(500);
        throw new Error('Failed to add comment.', error);
    }

})


const perspectiveComment = asyncHandler(async (req, res) =>{

    const {comment_content  } = req.body;

    const commenter_id = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
    const parent_perspective_id = mongoose.Types.ObjectId.isValid(req.body.parent_perspective_id) ? (new mongoose.Types.ObjectId(req.body.parent_perspective_id)) : null;
    
    const parentPerspective = await Perspective.findById(parent_perspective_id);

    if (!parentPerspective) {
        res.status(404)
        throw new Error(' Perspective not found');
    }




    try{
        // Create a new perspective comment
        const newComment = new PerspectiveComment({
            commented_by: commenter_id,
            parent_perspective : parent_perspective_id,
            comment_content,
         });

         // Save the new comment to the database
        const createdComment = await newComment.save();

         // Increment the comment count of the parent perspective atomically
         await Perspective.findByIdAndUpdate(parent_perspective_id, { $inc: { commentCount: 1 } });

        // Fetch the newly created comment with additional data
        const commentData = await PerspectiveComment.aggregate([
            {
                $match: {
                    _id: createdComment._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'perspectivecommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', commenter_id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', commenter_id] },
                            { $eq: ['$parentPerspective.user', commenter_id] },
                        ]
                    }    
                }
            },
            {
                $project: {
                    likes: 0,
                    commenter: 0,
                }
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: commentData[0] // Return the enriched comment data
        });


    }catch(error){
        res.status(500);
        throw new Error('Failed to add comment.', error);
    }

})


const perspectiveReply = asyncHandler(async (req, res) =>{

    const {comment_content  } = req.body;

    const commenter_id = mongoose.Types.ObjectId.isValid(req.user._id) ? (new mongoose.Types.ObjectId(req.user._id)) : null;
    const parent_perspective_id = mongoose.Types.ObjectId.isValid(req.body.parent_perspective_id) ? (new mongoose.Types.ObjectId(req.body.parent_perspective_id)) : null;
    const parent_comment_id = mongoose.Types.ObjectId.isValid(req.body.parent_comment_id) ? (new mongoose.Types.ObjectId(req.body.parent_comment_id)) : null;

    
    const parentPerspective = await Perspective.findById(parent_perspective_id);
    const parentComment = await PerspectiveComment.findById(parent_comment_id)

    if ( !parentPerspective || !parentComment) {
        res.status(404)
        throw new Error('User or Perspective or parent Comment not found');
    }

    try{
        // Create a new perspective comment
        const newComment = new PerspectiveComment({
            commented_by: commenter_id,
            parent_perspective : parent_perspective_id,
            is_reply: true,
            parent_comment : parent_comment_id,
            comment_content,
         });

         // Save the new comment to the database
        const createdReply = await newComment.save();

         // Increment the comment count of the parent perspective atomically
         await PerspectiveComment.findByIdAndUpdate(parent_comment_id, { $inc: { reply_count: 1 } });

         // Fetch the newly created reply with additional data
        const replyData = await PerspectiveComment.aggregate([
            {
                $match: {
                    _id: createdReply._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'perspectivecommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', commenter_id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {  
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', commenter_id] },
                            { $eq: ['$parentPerspective.user', commenter_id] },
                            { $eq: ['$parentComment.commented_by', commenter_id] }
                        ]
                    }      
                }
            },
            {
                $project: {
                    likes: 0,
                    commenter: 0
                }
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            comment: replyData[0] // Return the enriched reply data
        });

    }catch(error){
        res.status(500);
        throw new Error('Failed to add comment.', error);
    }

})

const getCommentsForQuery = asyncHandler(async (req, res) => {

    
    
    const { page = 1, limit = 10 } = req.query;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const query_id = new mongoose.Types.ObjectId(req.query.query_id);


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    try {
        const comments = await QueryComment.aggregate([
            {
                $match: {
                    parent_query: query_id,
                    is_reply: false,
                    is_blocked: false
                }
            },
            {
                $lookup: {
                    from: 'blockusers',
                    let: { commenter_id: '$commented_by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ['$blocking_user_id', currentUser] },
                                                { $eq: ['$blocked_user_id', '$$commenter_id'] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ['$blocking_user_id', '$$commenter_id'] },
                                                { $eq: ['$blocked_user_id', currentUser] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'blockInfo'
                }
            },
            {
                $match: {
                    blockInfo: { $eq: [] }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'queries',
                    localField: 'parent_query',
                    foreignField: '_id',
                    as: 'parentQuery'
                }
            },
            {
                $unwind: '$parentQuery'
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'parent_comment',
                    foreignField: '_id',
                    as: 'parentComment'
                }
            },
            {
                $unwind: {
                    path: '$parentComment',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $skip: skipNum
            },
            {
                $limit: limitNum
            },
            {
                $lookup: {
                    from: 'querycommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', currentUser] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', currentUser] },
                            { $eq: ['$parentQuery.user', currentUser] },
                            { $eq: ['$parentComment.commented_by', currentUser] }
                        ]
                    }
                }
            },
            {
                $project: {
                    blockInfo: 0,
                    likes: 0,
                    commenter: 0,
                    parentQuery: 0,
                    parentComment: 0
                }
            }
        ]);

        

        res.status(200).json({
            success: true,
            comments
        });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error('Failed to fetch comments.', error);
    }
});


const getCommentsForPerspective = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const perspective_id = new mongoose.Types.ObjectId(req.query.perspective_id)

    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    try {
        const comments = await PerspectiveComment.aggregate([
            {
                $match: {
                    parent_perspective: perspective_id,
                    is_reply: false,
                    is_blocked: false
                }
            },
            {
                $lookup: {
                    from: 'blockusers',
                    let: { commenter_id: '$commented_by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { 
                                            $and: [
                                                { $eq: ['$blocking_user_id', currentUser] }, 
                                                { $eq: ['$blocked_user_id', '$$commenter_id'] }
                                            ]
                                        },
                                        { 
                                            $and: [
                                                { $eq: ['$blocking_user_id', '$$commenter_id'] }, 
                                                { $eq: ['$blocked_user_id', currentUser] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'blockInfo'
                }
            },
            {
                $match: {
                    blockInfo: { $eq: [] }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'perspectives',
                    localField: 'parent_perspective',
                    foreignField: '_id',
                    as: 'parentPerspective'
                }
            },
            {
                $unwind: '$parentPerspective'
            },
            {
                $lookup: {
                    from: 'perspectivecomments',
                    localField: 'parent_comment',
                    foreignField: '_id',
                    as: 'parentComment'
                }
            },
            {
                $unwind: {
                    path: '$parentComment',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $skip: skipNum
            },
            {
                $limit: limitNum
            },
            {
                $lookup: {
                    from: 'perspectivecommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', currentUser] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', currentUser] },
                            { $eq: ['$parentPerspective.user', currentUser] },
                            { $eq: ['$parentComment.commented_by', currentUser] }
                        ]
                    }
                }
            },
            {
                $project: {
                    blockInfo: 0,
                    likes: 0,
                    commenter: 0,
                    parentPerspective: 0,
                    parentComment: 0
                }
            }
        ]);

        

        res.status(200).json({
            success: true,
            comments
        });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error('Failed to fetch comments.', error);
    }
});

const getRepliesForQueryComment = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const comment_id = new mongoose.Types.ObjectId(req.query.query_comment_id);

    

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    try {
        const replies = await QueryComment.aggregate([
            {
                $match: {
                    parent_comment: comment_id,
                    is_reply: true,
                    is_blocked: false
                }
            },
            {
                $lookup: {
                    from: 'blockusers',
                    let: { commenter_id: '$commented_by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { 
                                            $and: [
                                                { $eq: ['$blocking_user_id', currentUser] }, 
                                                { $eq: ['$blocked_user_id', '$$commenter_id'] }
                                            ]
                                        },
                                        { 
                                            $and: [
                                                { $eq: ['$blocking_user_id', '$$commenter_id'] }, 
                                                { $eq: ['$blocked_user_id', currentUser] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'blockInfo'
                }
            },
            {
                $match: {
                    blockInfo: { $eq: [] }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'querycomments',
                    localField: 'parent_comment',
                    foreignField: '_id',
                    as: 'parentComment'
                }
            },
            {
                $unwind: '$parentComment'
            },
            {
                $lookup: {
                    from: 'queries',
                    localField: 'parentComment.parent_query',
                    foreignField: '_id',
                    as: 'parentQuery'
                }
            },
            {
                $unwind: '$parentQuery'
            },
            {
                $skip: skipNum
            },
            {
                $limit: limitNum
            },
            {
                $lookup: {
                    from: 'querycommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', currentUser] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {  
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', currentUser] },
                            { $eq: ['$parentComment.commented_by', currentUser] },
                            { $eq: ['$parentQuery.user', currentUser] }
                        ]
                    }
                }
            },
            {
                $project: {
                    blockInfo: 0,
                    likes: 0,
                    commenter: 0,
                    parentComment: 0,
                    parentQuery: 0
                }
            }
        ]);

        

        res.status(200).json({
            success: true,
            replies
        });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error('Failed to fetch replies.', error);
    }
});


const getRepliesForPerspectiveComment = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const comment_id = new mongoose.Types.ObjectId(req.query.perspective_comment_id);


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    try {
        const replies = await PerspectiveComment.aggregate([
            {
                $match: {
                    parent_comment: comment_id,
                    is_reply: true,
                    is_blocked: false
                }
            },
            {
                $lookup: {
                    from: 'blockusers',
                    let: { commenter_id: '$commented_by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { 
                                            $and: [
                                                { $eq: ['$blocking_user_id', currentUser] }, 
                                                { $eq: ['$blocked_user_id', '$$commenter_id'] }
                                            ]
                                        },
                                        { 
                                            $and: [
                                                { $eq: ['$blocking_user_id', '$$commenter_id'] }, 
                                                { $eq: ['$blocked_user_id', currentUser] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'blockInfo'
                }
            },
            {
                $match: {
                    blockInfo: { $eq: [] }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'commented_by',
                    foreignField: '_id',
                    as: 'commenter'
                }
            },
            {
                $unwind: '$commenter'
            },
            {
                $match: {
                    'commenter.isBlocked': false
                }
            },
            {
                $lookup: {
                    from: 'perspectivecomments',
                    localField: 'parent_comment',
                    foreignField: '_id',
                    as: 'parentComment'
                }
            },
            {
                $unwind: '$parentComment'
            },
            {
                $lookup: {
                    from: 'perspectives',
                    localField: 'parentComment.parent_perspective',
                    foreignField: '_id',
                    as: 'parentPerspective'
                }
            },
            {
                $unwind: '$parentPerspective'
            },
            {
                $skip: skipNum
            },
            {
                $limit: limitNum
            },
            {
                $lookup: {
                    from: 'perspectivecommentlikes',
                    let: { comment_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$comment_id', '$$comment_id'] },
                                        { $eq: ['$user_id', currentUser] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $gt: [{ $size: '$likes' }, 0] },
                    commenterInfo: {  
                        _id: '$commenter._id',
                        name: '$commenter.name',
                        image: '$commenter.image',
                        googleProfilePicture: '$commenter.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$commented_by', currentUser] },
                            { $eq: ['$parentComment.commented_by', currentUser] },
                            { $eq: ['$parentPerspective.user', currentUser] }
                        ]
                    }
                }
            },
            {
                $project: {
                    blockInfo: 0,
                    likes: 0,
                    commenter: 0,
                    parentComment: 0,
                    parentPerspective: 0
                }
            }
        ]);

        

        res.status(200).json({
            success: true,
            replies
        });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error('Failed to fetch replies.', error);
    }
});



const likeQueryComment = asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
    const commentId = mongoose.Types.ObjectId.isValid(req.body.queryCommentId) ? new mongoose.Types.ObjectId(req.body.queryCommentId) : null;

  
    const existingLike = await QueryCommentLike.findOne({ comment_id: commentId, user_id: userId });
    if (existingLike) {
      res.status(400);
      throw new Error('Comment already liked');
    }
  
    const newLike = new QueryCommentLike({
      comment_id: commentId,
      user_id: userId,
    });
  
    await newLike.save();
  
    const commentData = await QueryComment.findByIdAndUpdate(commentId, { $inc: { like_count: 1 } }, { new: true });
  
    const notification = new Notification({
      user_id: commentData.commented_by,
      type: 'query_comment_like',
      message: 'Your query comment has a new like',
      metadata: {
        liker_id: userId,
        query_comment_id: commentData._id
      }
    });
  
    await notification.save();
  
    req.io.to(`${commentData.commented_by}`).emit('new_query_comment_like', (acknowledgment) => {
      if (acknowledgment) {
        console.log(`Notification sent to user ${commentData.commented_by} successfully`);
      } else {
        console.error(`Failed to send notification to user ${commentData.commented_by}`);
      }
    });
  
    res.status(201).json({ message: 'Comment liked successfully' });
  });
  
  const unlikeQueryComment = asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
    const commentId = mongoose.Types.ObjectId.isValid(req.body.queryCommentId) ? new mongoose.Types.ObjectId(req.body.queryCommentId) : null;

  
    const existingLike = await QueryCommentLike.findOne({ comment_id: commentId, user_id: userId });
  
    if (!existingLike) {
      res.status(400);
      throw new Error('Comment not liked yet');
    }
  
    await existingLike.deleteOne();
  
    await QueryComment.findByIdAndUpdate(commentId, { $inc: { like_count: -1 } });
  
    res.status(200).json({ message: 'Comment unliked successfully' });
  });


  const likePerspectiveComment = asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
    const commentId = mongoose.Types.ObjectId.isValid(req.body.perspectiveCommentId) ? new mongoose.Types.ObjectId(req.body.perspectiveCommentId) : null;

  
    const existingLike = await PerspectiveCommentLike.findOne({ comment_id: commentId, user_id: userId });
    if (existingLike) {
      res.status(400);
      throw new Error('Comment already liked');
    }
  
    const newLike = new PerspectiveCommentLike({
      comment_id: commentId,
      user_id: userId,
    });
  
    await newLike.save();
  
    const commentData = await PerspectiveComment.findByIdAndUpdate(commentId, { $inc: { like_count: 1 } }, { new: true });
  
    const notification = new Notification({
      user_id: commentData.commented_by,
      type: 'perspective_comment_like',
      message: 'Your perspective comment has a new like',
      metadata: {
        liker_id: userId,
        perspective_comment_id: commentData._id
      }
    });
  
    await notification.save();
  
    req.io.to(`${commentData.commented_by}`).emit('new_perpective_comment_like', (acknowledgment) => {
      if (acknowledgment) {
        console.log(`Notification sent to user ${commentData.commented_by} successfully`);
      } else {
        console.error(`Failed to send notification to user ${commentData.commented_by}`);
      }
    });
  
    res.status(201).json({ message: 'Comment liked successfully' });
  });
  
  const unlikePerspectiveComment = asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
    const commentId = mongoose.Types.ObjectId.isValid(req.body.perspectiveCommentId) ? new mongoose.Types.ObjectId(req.body.perspectiveCommentId) : null;

  
    const existingLike = await PerspectiveCommentLike.findOne({ comment_id: commentId, user_id: userId });
  
    if (!existingLike) {
      res.status(400);
      throw new Error('Comment not liked yet');
    }
  
    await existingLike.deleteOne();
  
    await PerspectiveComment.findByIdAndUpdate(commentId, { $inc: { like_count: -1 } });
  
    res.status(200).json({ message: 'Comment unliked successfully' });
  });

const reportComment = asyncHandler(async (req, res) => {
    const { reason, comment_type, comment_source } = req.body;
  
    const comment_id = mongoose.Types.ObjectId.isValid(req.body.comment_id) ? new mongoose.Types.ObjectId(req.body.comment_id) : null;
    
  
    try {
      // Check if a report from the same user on the same comment already exists
      let existingReport = await ReportComment.findOne({
        reporter_id: req.user._id,
        comment_id: comment_id
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
      const reportComment = new ReportComment({
        reporter_id: req.user._id,
        reason,
        comment_type,
        comment_source,
        comment_id
      });
  
      // Save the report to the database
      const createdReport = await reportComment.save();
  
      // Count the reports for this comment
      const reportCount = await ReportComment.countDocuments({
        comment_id
      });
  
      // Check if the report count exceeds the threshold and update the isBlocked field
      if (reportCount > 100) {
        if (comment_type === 'queryComment' && comment_source === 'user_profile') {
          await QueryComment.findByIdAndUpdate(comment_id, { is_blocked: true });
        } else if (comment_type === 'perspectiveComment' && comment_source === 'user_profile') {
          await PerspectiveComment.findByIdAndUpdate(comment_id, { is_blocked: true });
        }
      }
  
      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
      });
    } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error('Error submitting the report');
    }
  });

const deleteQueryComment = asyncHandler(async (req, res) => {

    
    
    const { comment_id } = req.body;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);


    const commentObjectId = new mongoose.Types.ObjectId(comment_id);

    const comment = await QueryComment.findById(commentObjectId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    const parentQuery = await Query.findById(comment.parent_query);

    if (!parentQuery) {
        res.status(404);
        throw new Error('Parent query not found');
    }

    const canDelete = comment.commented_by.equals(currentUser) || parentQuery.user.equals(currentUser);

    if (!canDelete) {
        res.status(403);
        throw new Error('You do not have permission to delete this comment');
    }

    const deleteCommentAndChildren = async (commentId) => {
        const childComments = await QueryComment.find({ parent_comment: commentId });

        for (const childComment of childComments) {
            await deleteCommentAndChildren(childComment._id);
        }

        await QueryCommentLike.deleteMany({ comment_id: commentId });
        await ReportComment.deleteMany({ comment_id: commentId });
        await QueryComment.findByIdAndDelete(commentId);
    };

    try {
        await deleteCommentAndChildren(commentObjectId);

        await Query.findByIdAndUpdate(parentQuery._id, { $inc: { commentCount: -1 } });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.log(error)
        res.status(500);
        throw new Error('Failed to delete comment');
    }
});

const deleteQueryReply = asyncHandler(async (req, res) => {
    const { reply_id } = req.body;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);

    const replyObjectId = new mongoose.Types.ObjectId(reply_id);

    const reply = await QueryComment.findById(replyObjectId);
    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }

    const parentComment = await QueryComment.findById(reply.parent_comment);
    const parentQuery = await Query.findById(reply.parent_query);

    if (!parentComment || !parentQuery) {
        res.status(404);
        throw new Error('Parent comment or query not found');
    }

    const canDelete = reply.commented_by.equals(currentUser) || parentComment.commented_by.equals(currentUser) || parentQuery.user.equals(currentUser);

    if (!canDelete) {
        res.status(403);
        throw new Error('You do not have permission to delete this reply');
    }

    const deleteReplyAndChildren = async (replyId) => {
        const childReplies = await QueryComment.find({ parent_comment: replyId });

        for (const childReply of childReplies) {
            await deleteReplyAndChildren(childReply._id);
        }

        await QueryCommentLike.deleteMany({ comment_id: replyId });
        await ReportComment.deleteMany({ comment_id: replyId });
        await QueryComment.findByIdAndDelete(replyId);
    };

    try {
        await deleteReplyAndChildren(replyObjectId);

        await QueryComment.findByIdAndUpdate(parentComment._id, { $inc: { replyCount: -1 } });

        res.status(200).json({
            success: true,
            message: 'Reply deleted successfully'
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete reply');
    }
});

const deletePerspectiveComment = asyncHandler(async (req, res) => {
    const { comment_id } = req.body;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);

    const commentObjectId = new mongoose.Types.ObjectId(comment_id);

    // Fetch the comment to be deleted
    const comment = await PerspectiveComment.findById(commentObjectId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Fetch the parent perspective
    const parentPerspective = await Perspective.findById(comment.parent_perspective);
    if (!parentPerspective) {
        res.status(404);
        throw new Error('Parent perspective not found');
    }

    // Check if the user has permission to delete the comment
    const canDelete = comment.commented_by.equals(currentUser) || parentPerspective.user.equals(currentUser);
    if (!canDelete) {
        res.status(403);
        throw new Error('You do not have permission to delete this comment');
    }

    // Recursive function to delete comment and its children
    const deleteCommentAndChildren = async (commentId) => {
        const childComments = await PerspectiveComment.find({ parent_comment: commentId });

        for (const childComment of childComments) {
            await deleteCommentAndChildren(childComment._id);
        }

        await PerspectiveCommentLike.deleteMany({ comment_id: commentId });
        await ReportComment.deleteMany({ comment_id: commentId });
        await PerspectiveComment.findByIdAndDelete(commentId);
    };

    try {
        await deleteCommentAndChildren(commentObjectId);

        // Decrement the comment count on the parent perspective
        await Perspective.findByIdAndUpdate(parentPerspective._id, { $inc: { commentCount: -1 } });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete comment');
    }
});

const deletePerspectiveReply = asyncHandler(async (req, res) => {
    const { reply_id } = req.body;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);

    const replyObjectId = new mongoose.Types.ObjectId(reply_id);

    // Fetch the reply to be deleted
    const reply = await PerspectiveComment.findById(replyObjectId);
    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }

    // Fetch the parent comment or perspective
    const parentPerspective = await Perspective.findById(reply.parent_perspective);
    const parentComment = await PerspectiveComment.findById(reply.parent_comment);
    if (!parentPerspective && !parentComment) {
        res.status(404);
        throw new Error('Parent perspective or comment not found');
    }

    // Check if the user has permission to delete the reply
    const canDelete = reply.commented_by.equals(currentUser) || (parentPerspective && parentPerspective.user.equals(currentUser)) || (parentComment && parentComment.commented_by.equals(currentUser));
    if (!canDelete) {
        res.status(403);
        throw new Error('You do not have permission to delete this reply');
    }

    // Recursive function to delete reply and its children
    const deleteReplyAndChildren = async (replyId) => {
        const childReplies = await PerspectiveComment.find({ parent_comment: replyId });

        for (const childReply of childReplies) {
            await deleteReplyAndChildren(childReply._id);
        }

        await PerspectiveCommentLike.deleteMany({ comment_id: replyId });
        await ReportComment.deleteMany({ comment_id: replyId });
        await PerspectiveComment.findByIdAndDelete(replyId);
    };

    try {
        await deleteReplyAndChildren(replyObjectId);

        
        await PerspectiveComment.findByIdAndUpdate(parentComment._id, { $inc: { replyCount: -1 } });
        

        res.status(200).json({
            success: true,
            message: 'Reply deleted successfully'
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete reply');
    }
});

const getAllReportsForAllCommentsFromAdmin = asyncHandler( async (req, res) => {
    const sortBy = req.query.sortBy || 'latest'; // or 'oldest'
    const pageNum = parseInt(req.query.pageNum, 10) || 1;
    const limitNum = parseInt(req.query.limitNum, 10) || 10;
  
    const sortOptions = {
      latest: { created_at: -1 },
      oldest: { created_at: 1 }
    };
  
    const sort = sortOptions[sortBy] || sortOptions.latest;
    const skip = (pageNum - 1) * limitNum;
    const limit = limitNum;
  
    try {
      const results = await ReportComment.aggregate([
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            reports: [
              { $sort: sort },
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: 'users',
                  localField: 'reporter_id',
                  foreignField: '_id',
                  as: 'reporter'
                }
              },
              { $unwind: '$reporter' },
              {
                $lookup: {
                  from: 'querycomments', // collection name
                  let: { commentId: '$comment_id' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$commentId'] } } },
                    {
                      $lookup: {
                        from: 'users',
                        localField: 'commented_by',
                        foreignField: '_id',
                        as: 'commented_by'
                      }
                    },
                    { $unwind: '$commented_by' }
                  ],
                  as: 'query_comment'
                }
              },
              {
                $lookup: {
                  from: 'perspectivecomments', // collection name
                  let: { commentId: '$comment_id' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$commentId'] } } },
                    {
                      $lookup: {
                        from: 'users',
                        localField: 'commented_by',
                        foreignField: '_id',
                        as: 'commented_by'
                      }
                    },
                    { $unwind: '$commented_by' }
                  ],
                  as: 'perspective_comment'
                }
              },
              {
                $addFields: {
                  comment: {
                    $cond: {
                      if: { $eq: ['$comment_type', 'queryComment'] },
                      then: { $arrayElemAt: ['$query_comment', 0] },
                      else: { $arrayElemAt: ['$perspective_comment', 0] }
                    }
                  }
                }
              },
              {
                $project: {
                  'reporter._id': 1,
                  'reporter.name': 1,
                  'comment._id': 1,
                  'comment.comment_content': 1,
                  'comment.commented_by._id': 1,
                  'comment.commented_by.name': 1,
                  reason: 1,
                  comment_type: 1,
                  comment_source: 1,
                  created_at: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] }
          }
        }
      ]);
  
      const response = {
        totalCount: results[0].totalCount || 0,
        reports: results[0].reports
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error('Error fetching comment reports:', err);
      throw new Error('Internal server error')
    }
  });

const getAllReportsForSingleCommentFromAdmin = asyncHandler( async (req, res) => {
    
    const commentId = new mongoose.Types.ObjectId(req.query.commentId);
    const pageNum = parseInt(req.query.pageNum, 10) || 1;
    const limitNum = parseInt(req.query.limitNum, 10) || 10;
  
    const skip = (pageNum - 1) * limitNum;
    const limit = limitNum;
  
    try {
      const results = await ReportComment.aggregate([
        { $match: { comment_id: commentId } },
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            reports: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: 'users',
                  localField: 'reporter_id',
                  foreignField: '_id',
                  as: 'reporter'
                }
              },
              { $unwind: '$reporter' },
              {
                $project: {
                  reportCommentId: '$_id',
                  reporter_name: '$reporter.name',
                  reason: 1,
                  reported_at: '$created_at'
                }
              }
            ]
          }
        },
        {
          $addFields: {
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] }
          }
        }
      ]);
  
      const response = {
        totalCount: results[0].totalCount || 0,
        reports: results[0].reports
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error('Error fetching comment reports:', err);
      res.status(500)
      throw new Error('Internal server error')
    }
  })
  
const removeReportOnCommentFromAdmin = asyncHandler(async (req, res) => {

const reportComment_Id =  new mongoose.Types.ObjectId(req.body.reportComment_Id);

    try {
     
  
      // Find and delete the report
      const deletedReport = await ReportComment.findOneAndDelete({ _id: reportComment_Id });
  
      if (!deletedReport) {
        res.status(404);
        throw new Error('Report not found');
      }
  
      res.status(200).json({ success: true, data: deletedReport });
    } catch (error) {
      console.error("handled here",'Error deleting report:', error.message);
      res.status(500);
      throw new Error('Failed to delete report');
    }
  });

  const blockQueryCommentFromAdmin = asyncHandler(async (req, res) => {
    const { queryComment_Id } = req.body;
  
    
  
    try {

  
      // Find the comment
      const queryComment = await QueryComment.findById(queryComment_Id);
      if (!queryComment) {
        res.status(404);
        throw new Error('Query comment not found');
      }
  
      // Check if already blocked
      if (queryComment.is_blocked) {
        res.status(400);
        throw new Error('Query comment is already blocked');
      }
  
      // Block the comment
      queryComment.is_blocked = true;
      await queryComment.save();
  
      res.status(200).json({ success: true, data: queryComment });
    } catch (error) {
      console.error('Error blocking query comment:', error.message);
      res.status(500);
      throw new Error('Failed to block query comment');
    }
  });


  const unblockQueryCommentFromAdmin = asyncHandler(async (req, res) => {
    const { queryComment_Id } = req.body;
   
  
    try {
    
      // Find the comment
      const queryComment = await QueryComment.findById(queryComment_Id);
      if (!queryComment) {
        res.status(404);
        throw new Error('Query comment not found');
      }
  
      // Check if already unblocked
      if (!queryComment.is_blocked) {
        res.status(400);
        throw new Error('Query comment is already unblocked');
      }
  
      // Unblock the comment
      queryComment.is_blocked = false;
      await queryComment.save();
  
      res.status(200).json({ success: true, data: queryComment });
    } catch (error) {
      console.error('Error unblocking query comment:', error.message);
      res.status(500);
      throw new Error('Failed to unblock query comment');
    }
  });

  const blockPerspectiveCommentFromAdmin = asyncHandler(async (req, res) => {
    const { perspectiveComment_Id } = req.body;
  
    try {
      // Find the comment
      const perspectiveComment = await PerspectiveComment.findById(perspectiveComment_Id);
      if (!perspectiveComment) {
        res.status(404);
        throw new Error('Perspective comment not found');
      }
  
      // Check if already blocked
      if (perspectiveComment.is_blocked) {
        res.status(400);
        throw new Error('Perspective comment is already blocked');
      }
  
      // Block the comment
      perspectiveComment.is_blocked = true;
      await perspectiveComment.save();
  
      res.status(200).json({ success: true, data: perspectiveComment });
    } catch (error) {
      console.error('Error blocking perspective comment:', error.message);
      res.status(500);
      throw new Error('Failed to block perspective comment');
    }
  });

  

  const unblockPerspectiveCommentFromAdmin = asyncHandler(async (req, res) => {
    const { perspectiveComment_Id } = req.body;
  
    try {
     
      // Find the comment
      const perspectiveComment = await PerspectiveComment.findById(perspectiveComment_Id);
      if (!perspectiveComment) {
        res.status(404);
        throw new Error('Perspective comment not found');
      }
  
      // Check if already unblocked
      if (!perspectiveComment.is_blocked) {
        res.status(400);
        throw new Error('Perspective comment is already unblocked');
      }
  
      // Unblock the comment
      perspectiveComment.is_blocked = false;
      await perspectiveComment.save();
  
      res.status(200).json({ success: true, data: perspectiveComment });
    } catch (error) {
      console.error('Error unblocking perspective comment:', error.message);
      res.status(500);
      throw new Error('Failed to unblock perspective comment');
    }
  });

  const deleteQueryCommentFromAdmin = asyncHandler(async (req, res) => {
    try {
        const commentObjectId = new mongoose.Types.ObjectId(req.body.queryComment_Id);

        // Fetch the comment to be deleted
        const comment = await QueryComment.findById(commentObjectId);
        
        if (!comment) {
            throw new Error('Comment not found');
        }

        // Recursive function to delete comment and its children
        const deleteCommentAndChildren = async (commentId) => {
            const childComments = await QueryComment.find({ parent_comment: commentId });

            for (const childComment of childComments) {
                await deleteCommentAndChildren(childComment._id);
            }

            await QueryCommentLike.deleteMany({ comment_id: commentId });
            await ReportComment.deleteMany({ comment_id: commentId });
            await QueryComment.findByIdAndDelete(commentId);
        };

        await deleteCommentAndChildren(commentObjectId);

        // Check if this is a direct reply (is_reply true) or a top-level comment
        if (comment.is_reply) {
            // Decrement reply count on the parent comment
            await QueryComment.findByIdAndUpdate(comment.parent_comment, { $inc: { replyCount: -1 } });
        } else {
            // Decrement comment count on the parent query
            await Query.findByIdAndUpdate(comment.parent_query, { $inc: { commentCount: -1 } });
        }

        res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Failed to delete comment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
});

const deletePerspectiveCommentFromAdmin = asyncHandler(async (req, res) => {
    try {
        const commentObjectId = new mongoose.Types.ObjectId(req.body.perspectiveComment_Id);

        // Fetch the comment to be deleted
        const comment = await PerspectiveComment.findById(commentObjectId);
        
        if (!comment) {
            throw new Error('Comment not found');
        }

        // Recursive function to delete comment and its children
        const deleteCommentAndChildren = async (commentId) => {
            const childComments = await PerspectiveComment.find({ parent_comment: commentId });

            for (const childComment of childComments) {
                await deleteCommentAndChildren(childComment._id);
            }

            await PerspectiveCommentLike.deleteMany({ comment_id: commentId });
            await ReportComment.deleteMany({ comment_id: commentId });
            await PerspectiveComment.findByIdAndDelete(commentId);
        };

        await deleteCommentAndChildren(commentObjectId);

        // Check if this is a direct reply (is_reply true) or a top-level comment
        if (comment.is_reply) {
            // Decrement reply count on the parent comment
            await PerspectiveComment.findByIdAndUpdate(comment.parent_comment, { $inc: { replyCount: -1 } });
        } else {
            // Decrement comment count on the parent query
            await Perspective.findByIdAndUpdate(comment.parent_perspective, { $inc: { commentCount: -1 } });
        }

        res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Failed to delete comment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
});


const getAllBlockedQueryComments = asyncHandler(async (req, res) => {
    try {
        const pageNum = parseInt(req.query.pageNum) || 1;
        const limitNum = parseInt(req.query.limitNum) || 10;
        const skipNum = (pageNum - 1) * limitNum;

        const results = await QueryComment.aggregate([
            { $match: { is_blocked: true } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skipNum },
                        { $limit: limitNum },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'commented_by',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: '$user' },
                        {
                            $lookup: {
                                from: 'reportcomments',
                                let: { comment_id: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $and: [{ $eq: ['$comment_id', '$$comment_id'] }, { $eq: ['$comment_type', 'queryComment'] }] } } },
                                    { $count: 'count' }
                                ],
                                as: 'reports'
                            }
                        },
                        {
                            $project: {
                                comment_id: '$_id',
                                content: '$comment_content',
                                commented_by: '$user.name',
                                created_at: '$commented_at',
                                report_count: { $size: '$reports' },
                                like_count: '$like_count',
                                reply_count: { $arrayElemAt: ['$reports.count', 0] },
                                is_blocked:1,
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$metadata',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        const total = results[0]?.metadata?.total || 0;
        const comments = results[0]?.data || [];

        
        res.status(200).json({
            total,
            comments
        });
    } catch (error) {
        res.status(500)
        throw new Error('Failed to fetch blocked query comments')
    }
});


const getAllBlockedPerspectiveComments = asyncHandler(async (req, res) => {
    try {
        const pageNum = parseInt(req.query.pageNum) || 1;
        const limitNum = parseInt(req.query.limitNum) || 10;
        const skipNum = (pageNum - 1) * limitNum;

        const results = await PerspectiveComment.aggregate([
            { $match: { is_blocked: true } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skipNum },
                        { $limit: limitNum },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'commented_by',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: '$user' },
                        {
                            $lookup: {
                                from: 'reportcomments',
                                let: { comment_id: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $and: [{ $eq: ['$comment_id', '$$comment_id'] }, { $eq: ['$comment_type', 'perspectiveComment'] }] } } },
                                    { $count: 'count' }
                                ],
                                as: 'reports'
                            }
                        },
                        {
                            $project: {
                                comment_id: '$_id',
                                content: '$comment_content',
                                commented_by: '$user.name',
                                created_at: '$commented_at',
                                report_count: { $size: '$reports' },
                                like_count: '$like_count',
                                reply_count: { $arrayElemAt: ['$reports.count', 0] },
                                is_blocked:1,
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$metadata',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        const total = results[0]?.metadata?.total || 0;
        const comments = results[0]?.data || [];

        res.status(200).json({
            total,
            comments
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blocked perspective comments' });
    }
});

module.exports = {
    queryComment,
    queryReply,
    perspectiveComment,
    perspectiveReply,
    getCommentsForQuery,
    getCommentsForPerspective,
    likeQueryComment,
    unlikeQueryComment,
    likePerspectiveComment,
    unlikePerspectiveComment,
    reportComment,
    getRepliesForQueryComment,
    getRepliesForPerspectiveComment,
    deleteQueryComment,
    deleteQueryReply,
    deletePerspectiveComment,
    deletePerspectiveReply,
    getAllReportsForAllCommentsFromAdmin,
    getAllReportsForSingleCommentFromAdmin,
    removeReportOnCommentFromAdmin,
    blockQueryCommentFromAdmin,
    unblockQueryCommentFromAdmin,
    blockPerspectiveCommentFromAdmin,
    unblockPerspectiveCommentFromAdmin,
    deleteQueryCommentFromAdmin,
    deletePerspectiveCommentFromAdmin,
    getAllBlockedPerspectiveComments,
    getAllBlockedQueryComments,
}