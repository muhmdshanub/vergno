const adminApp = require("../configs/firebaseAdmin.js");

const verifyFirebaseToken = async (req, res, next) => {

    const idToken = req.headers.authorization || req.body.firebaseToken;
    if (!idToken) {
      res.status(401)
      throw new Error('Not a valid token');

    }
  
    try {
      const decodedToken = await adminApp.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401)
      throw new Error('Not a valid user');
    }
  };

  module.exports = verifyFirebaseToken;