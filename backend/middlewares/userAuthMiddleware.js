const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.js');

const protectUser = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.user_Jwt;

  

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);

      const user = await User.findById(decoded.userId).select('-password');

      if (user && !user.isBlocked) {
        req.user = user;
        next();
      } else {
        res.status(403);
        throw new Error('Not authorized, user is blocked');
      }
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, user token failed');
    }
  } else {
    res.status(401);
    console.log(req.cookies)
    throw new Error('Not authorized, no user token');
  }
});

module.exports = protectUser ;