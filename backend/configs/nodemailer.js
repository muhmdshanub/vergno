// mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
            
    host: process.env.NODEMAILER_HOST ,
    port:  process.env.NODEMAILER_PORT ,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_EMAIL, // Replace with your Gmail email
        pass: process.env.NODEMAILER_PASSWORD, // Replace with your Gmail password
    },
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent:', mailOptions.to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Error sending email : ${error.message}`)
  }
};

module.exports = sendEmail;
