// birthdayEmail.js
const sendEmail = require('../configs/nodemailer');

const sendBirthdayEmail = async (user) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: user.email,
    subject: 'Happy Birthday!',
    text: `Happy Birthday, ${user.name}! We hope you have a great day!`,
  };

  await sendEmail(mailOptions);
};

module.exports = sendBirthdayEmail;
