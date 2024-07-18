const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/admin.js');

const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.admin_Jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

      req.admin = await Admin.findById(decoded.adminId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, admin token failed');
    }
  } else {
    res.status(401);
    console.log(req.cookies)
    throw new Error('Not authorized, no admin token');
  }
});

module.exports = protectAdmin;
