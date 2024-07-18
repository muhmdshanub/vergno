
const sendEmail = require('../configs/nodemailer');
require('dotenv').config();

// Function to send OTP via Email
const sendOtpEmail = async (email, otp) => {
    try {

        // Define the email options
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL, // Replace with your Gmail email
            to: email,
            subject: 'Verification Code',
            text: `Please use this otp code for verying your email: ${otp}`,
        };

        // Send the email
        await sendEmail(mailOptions);


    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Error sending email : ${error.message}`)
    }
};

module.exports =  sendOtpEmail;
