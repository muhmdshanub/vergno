// cronJobs.js
const cron = require('node-cron');
const User = require('../models/user'); // Adjust the path to your User model
const sendBirthdayEmail = require('../utils/sendBirthdayEmail');

const checkForBirthdays = async () => {

    console.log("activated the checkforbirthdays by cron job at ", new Date())
  const today = new Date();
  const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;

  const usersWithBirthdayToday = await User.find({
    dob: { $exists: true },
    $expr: {
      $eq: [
        { $concat: [{ $toString: { $month: '$dob' } }, '-', { $toString: { $dayOfMonth: '$dob' } }] },
        todayMonthDay,
      ],
    },
    $or: [
      { lastBirthdayEmailSent: { $exists: false } },
      {
        lastBirthdayEmailSent: {
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    ],
  });

  usersWithBirthdayToday.forEach(async (user) => {
    try {
      await sendBirthdayEmail(user);
      user.lastBirthdayEmailSent = today;
      await user.save();
    } catch (error) {
      console.error(`Error sending birthday email to ${user.email}:`, error);
    }
  });
};

// Schedule the cron job to run every day at 9 AM
cron.schedule('00 9 * * *', () => {
  checkForBirthdays();
});

module.exports = checkForBirthdays;
