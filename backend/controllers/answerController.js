const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Answer = require('../models/answer'); // Adjust the path as necessary
const Query = require('../models/query'); // Adjust the path as necessary
const User = require('../models/user');
const Notification = require('../models/notification')
const BlockUser  = require('../models/blockUser')
const ReportAnswer = require('../models/ReportAnswer')


const createAnswer = asyncHandler(async (req, res) => {
    const { answer_content, parent_query_id } = req.body;
  
    const answered_by = mongoose.Types.ObjectId.isValid(req.user._id) ? new mongoose.Types.ObjectId(req.user._id) : null;
    const parent_query = mongoose.Types.ObjectId.isValid(parent_query_id) ? new mongoose.Types.ObjectId(parent_query_id) : null;
  
  
    const parentQuery = await Query.findById(parent_query);
  
    if (!parentQuery) {
      res.status(404);
      throw new Error('Query not found');
    }
  
    if (typeof answer_content !== 'string' || answer_content.trim().length === 0 || answer_content.length > 500) {
      res.status(400);
      throw new Error('Answer content must be a valid text and under 500 characters');
    }
  
    try {
      // Create a new answer
      const newAnswer = new Answer({
        answered_by,
        parent_query,
        answer_content,
      });
  
      // Save the new answer to the database
      const createdAnswer = await newAnswer.save();
  
      // Increment the answer count of the parent query atomically
      await Query.findByIdAndUpdate(parent_query, { $inc: { answerCount: 1 } });
  
      // Create a notification for the user who asked the query
      const notification = new Notification({
        user_id: parentQuery.user, // The user who asked the query
        type: 'new_answer',
        message: 'Your query has a new answer',
        metadata: {
          answer_id: createdAnswer._id,
          answered_by
        }
      });
  
      await notification.save();
  
      // Emit the notification event
      req.io.to(`${parentQuery.user}`).emit('new_answer', (acknowledgment) => {
        if (acknowledgment) {
          console.log(`Notification sent to user ${parentQuery.user} successfully`);
        } else {
          console.error(`Failed to send notification to user ${parentQuery.user}`);
        }
      });
  
      // Fetch the newly created answer with additional data
      const answerData = await Answer.aggregate([
        {
          $match: {
            _id: createdAnswer._id
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'answered_by',
            foreignField: '_id',
            as: 'answerer'
          }
        },
        {
          $unwind: '$answerer'
        },
        {
          $match: {
            'answerer.isBlocked': false
          }
        },
        {
          $addFields: {
            answererInfo: {
              _id: '$answerer._id',
              name: '$answerer.name',
              image: '$answerer.image',
              googleProfilePicture: '$answerer.googleProfilePicture',
              
            }
          }
        },
        {
          $project: {
            answerer: 0,
          }
        }
      ]);
  
      res.status(201).json({
        success: true,
        message: 'Answer added successfully',
        answer: {...answerData[0], isAbleToDelete:true, isAbleToChanegHelpful : true} // Return the enriched answer data
      });
    } catch (error) {
      res.status(500);
      throw new Error('Failed to add answer.', error);
    }
  });

  const getAnswersForQuery = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const query_id = new mongoose.Types.ObjectId(req.query.query_id);


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    try {
        const answers = await Answer.aggregate([
            {
                $match: {
                    parent_query: query_id,
                    isBlocked: false
                }
            },
            {
                $lookup: {
                    from: 'blockusers',
                    let: { answerer_id: '$answered_by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ['$blocking_user_id', currentUser] },
                                                { $eq: ['$blocked_user_id', '$$answerer_id'] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ['$blocking_user_id', '$$answerer_id'] },
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
                    localField: 'answered_by',
                    foreignField: '_id',
                    as: 'answerer'
                }
            },
            {
                $unwind: '$answerer'
            },
            {
                $match: {
                    'answerer.isBlocked': false
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
                $skip: skipNum
            },
            {
                $limit: limitNum
            },
            {
                $addFields: {
                    answererInfo: {
                        _id: '$answerer._id',
                        name: '$answerer.name',
                        image: '$answerer.image',
                        googleProfilePicture: '$answerer.googleProfilePicture'
                    },
                    isAbleToDelete: {
                        $or: [
                            { $eq: ['$answered_by', currentUser] },
                            { $eq: ['$parentQuery.user', currentUser] }
                        ]
                    },
                    isAbleToChangeHelpful: { $eq: ['$parentQuery.user', currentUser] }
                }
            },
            {
                $project: {
                    blockInfo: 0,
                    answerer: 0,
                    parentQuery: 0
                }
            }
        ]);

        

        res.status(200).json({
            success: true,
            answers
        });
    } catch (error) {
        console.log(error);
        res.status(500);
        throw new Error('Failed to fetch answers.', error);
    }
});

const reportAnswer = asyncHandler(async (req, res) => {
  const { reason, answer_source } = req.body;

  const answer_id = mongoose.Types.ObjectId.isValid(req.body.answer_id) ? new mongoose.Types.ObjectId(req.body.answer_id) : null;

  // Validate input
  if (!reason || !answer_source || !answer_id) {
    console.log(reason, answer_source, answer_id);
    res.status(400);
    throw new Error('All fields are required');
  }

  try {
    // Check if a report from the same user on the same answer already exists
    let existingReport = await ReportAnswer.findOne({
      reporter_id: req.user._id,
      answer_id: answer_id
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
    const reportAnswer = new ReportAnswer({
      reporter_id: req.user._id,
      reason,
      answer_source,
      answer_id
    });

    // Save the report to the database
    const createdReport = await reportAnswer.save();

    // Count the reports for this answer
    const reportCount = await ReportAnswer.countDocuments({
      answer_id
    });

    // Check if the report count exceeds the threshold and update the isBlocked field
    if (reportCount > 100) {
      if (answer_source === 'user_profile') {
        await Answer.findByIdAndUpdate(answer_id, { is_blocked: true });
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

const deleteQueryAnswer = asyncHandler(async (req, res) => {

  
  
  const { answer_id } = req.body;
  const currentUser = new mongoose.Types.ObjectId(req.user._id);

  const answerObjectId = new mongoose.Types.ObjectId(answer_id);

  const answer = await Answer.findById(answerObjectId);
  if (!answer) {
      res.status(404);
      throw new Error('Answer not found');
  }

  const parentQuery = await Query.findById(answer.parent_query);

  if (!parentQuery) {
      res.status(404);
      throw new Error('Parent query not found');
  }

  const canDelete = answer.answered_by.equals(currentUser) || parentQuery.user.equals(currentUser);

  if (!canDelete) {
      res.status(403);
      throw new Error('You do not have permission to delete this answer');
  }

  try {
      // Delete all reports associated with the answer
      await ReportAnswer.deleteMany({ answer_id: answerObjectId });

      // Delete the answer
      await Answer.findByIdAndDelete(answerObjectId);

      // Decrease the answer count of the parent query
      await Query.findByIdAndUpdate(parentQuery._id, { $inc: { answerCount: -1 } });

      res.status(200).json({
          success: true,
          message: 'Answer deleted successfully'
      });
  } catch (error) {
      console.log(error);
      res.status(500);
      throw new Error('Failed to delete answer');
  }
});


const getAllBlockedAnswersFromAdmin = asyncHandler(async (req, res) => {
  try {
      const pageNum = parseInt(req.query.pageNum) || 1;
      const limitNum = parseInt(req.query.limitNum) || 10;
      const skipNum = (pageNum - 1) * limitNum;

      const results = await Answer.aggregate([
          { $match: { isBlocked: true } },
          {
              $facet: {
                  metadata: [{ $count: "total" }],
                  data: [
                      { $skip: skipNum },
                      { $limit: limitNum },
                      {
                          $lookup: {
                              from: 'users',
                              localField: 'answered_by',
                              foreignField: '_id',
                              as: 'user'
                          }
                      },
                      { $unwind: '$user' },
                      {
                          $lookup: {
                              from: 'reportanswers',
                              let: { answer_id: '$_id' },
                              pipeline: [
                                  { $match: { $expr: { $and: [{ $eq: ['$answer_id', '$$answer_id'] }, { $eq: ['$answer_type', 'queryAnswer'] }] } } },
                                  { $count: 'count' }
                              ],
                              as: 'reports'
                          }
                      },
                      {
                          $project: {
                              answer_id: '$_id',
                              content: '$answer_content',
                              answered_by: '$user.name',
                              created_at: '$answered_at',
                              report_count: { $size: '$reports' },
                              isBlocked: 1,
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
      const answers = results[0]?.data || [];


      

      res.status(200).json({
          total,
          answers
      });
  } catch (error) {
      res.status(500)
      throw new Error('Failed to fetch blocked answers')
  }
});

const unblockQueryAnswerFromAdmin = asyncHandler(async (req, res) => {
  const { answer_Id } = req.body;
  

  try {
      

      // Find the answer
      const answer = await Answer.findById(answer_Id);
      if (!answer) {
          res.status(404);
          throw new Error('Query answer not found');
      }

      // Check if already unblocked
      if (!answer.isBlocked) {
          res.status(400);
          throw new Error(' answer is already unblocked');
      }

      // Unblock the answer
      answer.isBlocked = false;
      await answer.save();

      res.status(200).json({ success: true, data: answer });
  } catch (error) {
      console.error('Error unblocking query answer:', error.message);
      res.status(500);
      throw new Error('Failed to unblock query answer');
  }
});

const deleteQueryAnswerFromAdmin = asyncHandler(async (req, res) => {
  try {
      const answerObjectId = new mongoose.Types.ObjectId(req.body.answer_Id);

      

      // Fetch the answer to be deleted
      const answer = await Answer.findById(answerObjectId);

      if (!answer) {
          throw new Error('Answer not found');
      }

      // Delete reports associated with the answer
      await ReportAnswer.deleteMany({ answer_id: answerObjectId });

      // Delete the answer itself
      await Answer.findByIdAndDelete(answerObjectId);

      // Decrement the answer count on the parent query
      await Query.findByIdAndUpdate(answer.parent_query, { $inc: { answerCount: -1 } });

      res.status(200).json({ success: true, message: 'Answer deleted successfully' });
  } catch (error) {
      console.error('Failed to delete answer:', error);
      res.status(500).json({ success: false, message: 'Failed to delete answer' });
  }
});

const getAllReportsForSingleAnswerFromAdmin = asyncHandler(async (req, res) => {
  
  const answerId = new mongoose.Types.ObjectId(req.query.answerId);
  const pageNum = parseInt(req.query.pageNum, 10) || 1;
  const limitNum = parseInt(req.query.limitNum, 10) || 10;

  const skip = (pageNum - 1) * limitNum;
  const limit = limitNum;

  try {
    const results = await ReportAnswer.aggregate([
      { $match: { answer_id: answerId } },
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
                reportAnswerId: '$_id',
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
    console.error('Error fetching answer reports:', err);
    res.status(500);
    throw new Error('Internal server error');
  }
});


const removeReportOnAnswerFromAdmin = asyncHandler(async (req, res) => {
  const reportAnswer_Id = new mongoose.Types.ObjectId(req.body.reportAnswerId);

  

  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reportAnswer_Id)) {
      res.status(400);
      throw new Error('Invalid report ID');
    }

    // Find and delete the report
    const deletedReport = await ReportAnswer.findOneAndDelete({ _id: reportAnswer_Id });

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

module.exports = {
    createAnswer,
    getAnswersForQuery,
    reportAnswer,
    deleteQueryAnswer,
    getAllBlockedAnswersFromAdmin,
    unblockQueryAnswerFromAdmin,
    deleteQueryAnswerFromAdmin,
    getAllReportsForSingleAnswerFromAdmin,
    removeReportOnAnswerFromAdmin,


}