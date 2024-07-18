const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const BlockUser = require('../models/blockUser.js')
const Follow = require('../models/follow.js')
const Message = require('../models/message.js')
const Conversation = require('../models/conversation.js')


const getAllExistingConversations = asyncHandler(async (req, res) => {

  

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { pageNum = 1, limitNum = 10, searchBy = '' } = req.query;

  const page = parseInt(pageNum, 10);
  const limit = parseInt(limitNum, 10);

  try {
    const conversations = await Conversation.aggregate([
      // Match stage to filter conversations
      {
        $match: {
          'participants.user_id': userId,
        },
      },
      // Project stage to filter unnecessary fields early
      {
        $project: {
          participants: {
            $filter: {
              input: '$participants',
              as: 'participant',
              cond: { $ne: ['$$participant.user_id', userId] }
            }
          },
          last_message: 1,
          last_message_at: 1,
        },
      },
      // Lookup to fetch specific fields from users collection and perform matching
      {
        $lookup: {
          from: 'users',
          let: { participant_ids: '$participants.user_id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$participant_ids'] },
                name: { $regex: searchBy, $options: 'i' },
              },
            },
            {
              $project: {
                name: 1,
                _id: 1,
                image: 1,
                googleProfilePicture: 1,
                isOnline: 1,
              },
            },
          ],
          as: 'participant',
        },
      },
      // Filter out conversations without matched participants
      {
        $match: {
          participant: { $ne: [] },
        },
      },
      // Sorting stage by last_message_at descending
      { $sort: { last_message_at: -1 } },
      // Facet stage to handle pagination and count total documents
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }, {$project :{participants : 0}}],
        },
      },
      // Unwind the facet data array
      { $unwind: '$data' },
      // Lookup the conversation again to get the full participants array
      {
        $lookup: {
          from: 'conversations',
          localField: 'data._id',
          foreignField: '_id',
          as: 'full_conversation',
        },
      },
      // Unwind the full_conversation array
      { $unwind: '$full_conversation' },
      // Add unread_message_count from the full participants array
      {
        $addFields: {
          'data.unread_message_count': {
            $reduce: {
              input: '$full_conversation.participants',
              initialValue: 0,
              in: {
                $cond: {
                  if: { $eq: ['$$this.user_id', userId] },
                  then: '$$this.unreadCount',
                  else: '$$value'
                }
              }
            }
          }
        }
      },
      // Group back the results
      {
        $group: {
          _id: null,
          metadata: { $first: '$metadata' },
          data: { $push: '$data' },
        }
      },
    ]);

    const result = conversations[0] || { metadata: [], data: [] };
    const totalConversations = result.metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalConversations / limit);

      
    res.status(200).json({
      conversations: result.data,
      currentPage: page,
      totalPages,
      totalConversations,
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error(`Server error: ${error.message}`);
  }
});


const getSingleExistingConversation = asyncHandler(async (req, res) => {
  

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { conversationId } = req.query;

  try {
    const conversation = await Conversation.aggregate([
      // Match stage to filter the specific conversation
      {
        $match: {
          _id: new mongoose.Types.ObjectId(conversationId),
          'participants.user_id': userId,
        },
      },
      // Project stage to reshape the output
      {
        $project: {
          _id: 1,
          last_message: 1,
          unread_message_count: {
            $reduce: {
              input: '$participants',
              initialValue: 0,
              in: {
                $cond: {
                  if: { $eq: ['$$this.user_id', userId] },
                  then: '$$this.unreadCount',
                  else: '$$value'
                }
              }
            }
          },
          participant: {
            $filter: {
              input: '$participants',
              as: 'participant',
              cond: { $ne: ['$$participant.user_id', userId] }
            }
          },
        },
      },
      // Lookup stage to fetch user details for participants
      {
        $lookup: {
          from: 'users',
          localField: 'participant.user_id',
          foreignField: '_id',
          as: 'participantInfo',
        },
      },
      // Project stage to reshape participantInfo array
      {
        $project: {
          _id: 1,
          last_message: 1,
          unread_message_count: 1,
          participant: {
            $map: {
              input: '$participantInfo',
              as: 'info',
              in: {
                _id: '$$info._id',
                name: '$$info.name',
                image: '$$info.image',
                googleProfilePicture: '$$info.googleProfilePicture',
                isOnline: '$$info.isOnline',
              },
            },
          },
        },
      },
    ]);

    if (conversation.length === 0) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    res.status(200).json(conversation[0]);
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error(`Server error: ${error.message}`);
  }
});


// const getAllExistingConversations = asyncHandler(async (req, res) => {
//   const userId = new mongoose.Types.ObjectId(req.user._id);
//   const { pageNum = 1, limitNum = 10, searchBy = '' } = req.query;

  
//   const page = parseInt(pageNum, 10);
//   const limit = parseInt(limitNum, 10);

//   try {
//     const conversations = await Conversation.aggregate([
//       // Match stage to filter conversations
//       {
//         $match: {
//           'participants.user_id': userId, // Update to match the new schema structure
//         },
//       },

//       // Project stage to filter unnecessary fields early
//       {
//         $project: {
//           participants: {
//             $filter: {
//               input: '$participants',
//               as: 'participant',
//               cond: { $ne: ['$$participant.user_id', userId] }, // Update to match the new schema structure
//             },
//           },
//           last_message: 1,
//           last_message_at: 1,
//           unread_message_count: 1, // If you're using unreadCount from participants, adjust here
//         },
//       },

//       // Lookup to fetch specific fields from users collection and perform matching
//       {
//         $lookup: {
//           from: 'users',
//           let: { participant_ids: '$participants.user_id' }, // Update to match the new schema structure
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ['$_id', '$$participant_ids'] },
//                 name: { $regex: searchBy, $options: 'i' },
//               },
//             },
//             {
//               $project: {
//                 name: 1,
//                 _id: 1,
//                 image: 1,
//                 googleProfilePicture: 1,
//                 isOnline: 1,
//               },
//             },
//           ],
//           as: 'participant',
//         },
//       },

//       // Filter out conversations without matched participants
//       {
//         $match: {
//           participant: { $ne: [] },
//         },
//       },

//       // Sorting stage by last_message_at descending
//       { $sort: { last_message_at: -1 } },

//       // Facet stage to handle pagination and count total documents
//       {
//         $facet: {
//           metadata: [{ $count: 'total' }],
//           data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
//         },
//       },
//     ]);

//     const result = conversations[0];
//     const totalConversations = result.metadata[0]?.total || 0;
//     const totalPages = Math.ceil(totalConversations / limit);

    

//     res.status(200).json({
//       conversations: result.data,
//       currentPage: page,
//       totalPages,
//       totalConversations,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500);
//     throw new Error(`Server error: ${error.message}`);
//   }
// });


const getAllNewConversations = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { pageNum = 1, limitNum = 10, searchBy = '' } = req.query;

  const page = parseInt(pageNum, 10);
  const limit = parseInt(limitNum, 10);

  try {
    const users = await Follow.aggregate([
      // Match followed users who do not have conversations with userId
      {
        $match: {
          following_user_id: userId,
          is_accepted: true,
        },
      },

      // Lookup to check if each followed user has conversations with userId
      {
        $lookup: {
          from: 'conversations',
          let: { followed_user_id: '$followed_user_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [userId, '$participants.user_id'] },
                    { $in: ['$$followed_user_id', '$participants.user_id'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: 'existingConversations',
        },
      },

      // Filter out users with existing conversations
      {
        $match: {
          'existingConversations.0': { $exists: false },
        },
      },

      // Lookup to fetch user details and perform matching by name
      {
        $lookup: {
          from: 'users',
          let: { followed_user_id: '$followed_user_id', searchBy: searchBy },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$followed_user_id'] },
                    { $regexMatch: { input: '$name', regex: searchBy, options: 'i' } },
                    { $eq: ['$isBlocked', false] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
                googleProfilePicture: 1,
                isOnline: 1,
              },
            },
          ],
          as: 'userDetails',
        },
      },

      // Unwind users to separate documents
      { $unwind: '$userDetails' },

      // Project to shape final output
      {
        $project: {
          _id: '$userDetails._id',
          name: '$userDetails.name',
          image: '$userDetails.image',
          googleProfilePicture: '$userDetails.googleProfilePicture',
          isOnline: '$userDetails.isOnline',
        },
      },

      // Sorting stage by name ascending (optional)
      { $sort: { name: 1 } },

      // Count total documents stage
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    const result = users[0];
    const totalUsers = result.metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users: result.data,
      currentPage: page,
      totalPages,
      totalUsers,
    });

  } catch (error) {
    console.error(error);
    res.status(500)
    throw new Error(`Server error : ${error.message}`);
  }
});



const getUnreadMessageCount = asyncHandler(async (req, res) => {

    const userId = new mongoose.Types.ObjectId(req.user._id); // Assuming you have userId available in req.user._id
  
    try {
      const unreadMessageCount = await Message.countDocuments({
        receiver: userId,
        is_read: false // Adjust this condition based on your schema for unread messages
      });
  
     
      res.status(200).json({ unreadMessageCount });
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      res.status(500)
      throw new Error(`Failed to fetch unread message count : ${error.message}`)
    }
  });

const canSendMessage = asyncHandler(async (req, res) => {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);
    const { recipientId } = req.query;
  
    
  
    try {
      const recipient = await User.findById(recipientId);
  
      if (!recipient) {
        res.status(404)
        throw new Error( 'Recipient not found')
      }
  
      if (recipient.isBlocked) {
        res.status(403)
        throw new Error( 'Recipient is blocked by the application')
      }
  
      const blockedByCurrentUser = await BlockUser.findOne({
        blocking_user_id: currentUserId,
        blocked_user_id: recipientId,
      });
  
      const blockedByRecipient = await BlockUser.findOne({
        blocking_user_id: recipientId,
        blocked_user_id: currentUserId,
      });
  
      if (blockedByCurrentUser || blockedByRecipient) {
        return res.status(403).json({ message: 'You are not allowed to send a message to this user' });
      }
  
      res.status(200).json({ success : true, message: 'You can send a message to this user' });
    } catch (error) {
      console.error(error);
      res.status(500)
      throw new Error( `Server error: ${error.message}`)
    }
  });

// const sendMessage = asyncHandler( async (req, res) => {

//   const { type = 'text', text, recipientId, conversationId, isExistingConversation } = req.body;


//   const senderId = req.user._id;
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     let conversation;

//     if (conversationId && isExistingConversation) {
//       conversation = await Conversation.findById(conversationId).session(session);
//       if (!conversation) {
//         await session.abortTransaction();
//         res.status(404)
//         throw new Error('Conversation not found.')
//       }
//       if (!conversation.participants.some(p => p.id.equals(senderId))) {
//         await session.abortTransaction();
//         res.status(403)
//         throw new Error('Sender is not a participant of this conversation.')
//       }
//     } else {
//       conversation = await Conversation.findOne({
//         participants: { $all: [{ $elemMatch: { id: senderId } }, { $elemMatch: { id: recipientId } }] }
//       }).session(session);

//       if (!conversation) {
//         conversation = new Conversation({
//           participants: [
//             { id: senderId },
//             { id: recipientId }
//           ]
//         });
//         await conversation.save({ session });
//       }
//     }

//     const message = new Message({
//       conversation_id: conversation._id,
//       sender: senderId,
//       receiver: recipientId,
//       type: 'text',
//       text,
//       sent_at: new Date()
//     });

//     await message.save({ session });

//     conversation.last_message = {
//       sender: senderId,
//       text,
//       sent_at: new Date()
//     };

//     const recipient = conversation.participants.find(p => p.id.equals(recipientId));
//     if (recipient) {
//       recipient.unreadCount += 1;
//     }

//     await conversation.save({ session });

//     await session.commitTransaction();
//     session.endSession();

    
//     req.io.to(recipientId.toString()).emit('new_message', { message });

//     return res.status(200).json({ message: 'Message sent successfully.', conversationId: conversation._id, messageId: message._id });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error(error);
//     res.status(500)
//     throw new Error(`An error occurred while sending the message : ${error?.message}`)
//   }
// })

const sendMessage = asyncHandler(async (req, res) => {
  const { type = 'text', text, recipientId, conversationId, isExistingConversation } = req.body;
  const senderId = req.user._id;

  try {
    let conversation;
    

    if (conversationId && isExistingConversation) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found.');
      }
      if (!conversation.participants.some(p => p.user_id.equals(senderId))) {
        res.status(403);
        throw new Error('Sender is not a participant of this conversation.');
      }
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [{ $elemMatch: { user_id: senderId } }, { $elemMatch: { user_id: recipientId } }] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [
            { user_id: senderId },
            { user_id: recipientId }
          ]
        });
         await conversation.save();
      }
    }

    const message = new Message({
      conversation_id: conversation._id,
      sender: senderId,
      receiver: recipientId,
      type: 'text',
      text,
      sent_at: new Date()
    });

    await message.save();

    conversation.last_message = {
      sender: senderId,
      text,
      sent_at: new Date()
    };

    const recipient = conversation.participants.find(p => p.user_id.equals(recipientId));
    if (recipient) {
      recipient.unreadCount += 1;
    }

   

   const messageResponse = { 
    _id: message._id,
    conversation_id : message.conversation_id,
    sender : message.sender,
    receiver : message.receiver,
    type : message.type,
    text : message.text,
    media_url :  message.media_url,
    sent_at : message.sent_at,
    is_read : message.is_read,
    received_at : message.recieved_at,
    read_at : message.read_at,
    sent_by_you : false}

    conversation.save().then((conversationSaved) => {
      if (conversationSaved) {
        req.io.to(recipientId.toString()).emit('new_message', { messageResponse });
      }
    }).catch(error => {
      console.error('Error saving conversation:', error);
    });
    

    return res.status(200).json({ success: true, message: 'Message sent successfully.', conversationId: conversation._id, messageId: message._id, messageResponse : { ...messageResponse, sent_by_you : true}  });
 
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error(`An error occurred while sending the message : ${error?.message}`);
  }
});

// const getAllMessageForConversation = asyncHandler(async (req, res) => {


  
//   const primaryUserId = new mongoose.Types.ObjectId(req.user._id);
//   const { conversationId,  pageNum = 1, limitNum = 10 } = req.query;

//   // Convert parameters to proper types
//   const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
//   const page = parseInt(pageNum, 10);
//   const limit = parseInt(limitNum, 10);

//   try {
//     // Validate conversation
//     const conversation = await Conversation.findById(conversationObjectId);
//     if (!conversation) {
//       res.status(404)
//       throw new Error('Conversation not found in get all messages')
//     }

//     // Check if the primary user is a participant
//     const primaryUserParticipant = conversation.participants.find(participant => participant.user_id.equals(primaryUserId));
//     if (!primaryUserParticipant) {
//       res.status(403)
//       throw new Error('User is not a participant of this conversation' );
//     }

//     // Get unread count for primary user
//     const unreadCount = primaryUserParticipant.unreadCount;

//     // Fetch messages using aggregation with facet for better performance
//     const messagesAggregation = await Message.aggregate([
//       { $match: { conversation_id: conversationObjectId } },
//       { $sort: { sent_at: -1 } },
//       {
//         $facet: {
//           messages: [
//             { $skip: (page - 1) * limit },
//             { $limit: limit },
//             {
//               $addFields: {
//                 sended_by_you: { $eq: ['$sender', primaryUserId] }
//               }
//             },
//             {
//               $project: {
//                 conversation_id: 1,
//                 sender: 1,
//                 receiver: 1,
//                 type: 1,
//                 text: 1,
//                 media_url: 1,
//                 sent_at: 1,
//                 is_read: 1,
//                 received_at: 1,
//                 read_at: 1,
//                 sended_by_you: 1
//               }
//             }
//           ],
//           totalMessages: [
//             { $count: 'count' }
//           ]
//         }
//       }
//     ]);

//     const messages = messagesAggregation[0].messages;
//     const totalMessages = messagesAggregation[0].totalMessages[0]?.count || 0;
//     const totalPages = Math.ceil(totalMessages / limit);

//     res.status(200).json({
//       messages,
//       unreadCount,
//       currentPage: page,
//       totalPages,
//       totalMessages,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500)
//     throw new Error(`Server error: ${error.message}`)
//   }
// });


const getAllMessagesForConversation = asyncHandler(async (req, res) => {
  

  const primaryUserId = new mongoose.Types.ObjectId(req.user._id);
  const { conversationId, pageNum = 1, limitNum = 10, initialFetch = false } = req.query;

  const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
  const page = parseInt(pageNum, 10);
  const limit = parseInt(limitNum, 10);

  try {
    const conversation = await Conversation.findById(conversationObjectId);
    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found in get all messages');
    }

    const primaryUserParticipant = conversation.participants.find(participant => participant.user_id.equals(primaryUserId));
    if (!primaryUserParticipant) {
      res.status(403);
      throw new Error('User is not a participant of this conversation');
    }

    const unreadCount = primaryUserParticipant.unreadCount;
    let fetchPage = page;

    if (initialFetch === true && unreadCount > 0) {
      fetchPage = Math.ceil(unreadCount / limit);
    }

    
    const messagesAggregation = await Message.aggregate([
      { $match: { conversation_id: conversationObjectId } },
      { $sort: { sent_at: -1 } },
      { $skip: (fetchPage - 1) * limit },
      { $limit: limit },
      {
        $addFields: {
          sent_by_you: { $eq: ['$sender', primaryUserId] },
        },
      },
      {
        $project: {
          conversation_id: 1,
          sender: 1,
          receiver: 1,
          type: 1,
          text: 1,
          media_url: 1,
          sent_at: 1,
          is_read: 1,
          received_at: 1,
          read_at: 1,
          sent_by_you: 1,
        },
      },
    ]);

    const totalMessages = await Message.countDocuments({ conversation_id: conversationObjectId });
    const totalPages = Math.ceil(totalMessages / limit);


    

    res.status(200).json({
      messages: messagesAggregation,
      unreadCount,
      currentPage: fetchPage,
      totalPages,
      totalMessages,
      success:true,
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error(`Server error: ${error.message}`);
  }
});


const markAsReadMessage = asyncHandler(async (req, res) => {

  const messageId = req.body.messageId;
  const userId = req.user._id; 

  console.log("message mark as read request came for messageId", messageId)

  try {

    // Step 1: Validate and Update Message
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: userId }, // Ensure messageId is valid and user is the receiver
      { $set: { is_read: true, read_at: new Date() } },
      { new: true } // Return the updated document
    );

    if (!message) {
      res.status(404)
      throw new Error('Message not found or you are not authorized to mark it as read.')
    }

    // Step 2: Update Conversation
    await Conversation.updateOne(
        {
          _id: message.conversation_id,
          'participants.user_id': userId,
          'participants.unreadCount': { $gt: 0 }  // Ensure unreadCount is greater than 0
        },
        { $inc: { 'participants.$.unreadCount': -1 } }
      );

    // Step 3: Emit Event (Assuming you have a socket.io instance available)
    // socket.emit('message_read', { messageId: message._id });

    req.io.to(message.sender.toString()).emit('message_read', message );

    // Step 4: Return Success Response
    return res.status(200).json({ success : true, messageResponse : message });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500)
    throw new Error( `Internal server error : ${error.message}`)
  }
})


module.exports = {
    getAllExistingConversations,
    getSingleExistingConversation,
    getAllNewConversations,
    getUnreadMessageCount,
    canSendMessage,
    sendMessage,
    getAllMessagesForConversation,
    markAsReadMessage,

}