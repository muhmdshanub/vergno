const jwt = require('jsonwebtoken');

const generateAdminToken = (res, adminId) => {
  const token = jwt.sign({ adminId }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: '10d',
  });

  res.cookie('admin_Jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 10 * 24 * 60 * 60 * 1000, // 30 days
  });
};

module.exports = generateAdminToken;
