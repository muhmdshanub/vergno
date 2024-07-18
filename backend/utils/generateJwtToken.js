// const jwt = require('jsonwebtoken');

// const generateUserToken = async (res, userId) => {
//   const token = jwt.sign({ userId }, process.env.USER_JWT_SECRET, {
//     expiresIn: '30d',
//   });

//   res.cookie('user_Jwt', token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
//     sameSite: 'strict', // Prevent CSRF attacks
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//   });
// };

// module.exports =  generateUserToken;


const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateUserToken = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.USER_JWT_SECRET, {
    expiresIn: '60m', // Shorter expiration time for access token
  });

  const refreshToken = jwt.sign({ userId }, "gjh4*&654%$FG67bn9", {
    expiresIn: '30d', // Longer expiration time for refresh token
  });

  res.cookie('user_Jwt', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('user_RefreshJwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

module.exports = generateUserToken;
