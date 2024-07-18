// Middleware to handle validation results

const {validationResult } = require('express-validator');


const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.body)
      console.log(JSON.stringify(errors))
      const error = new Error('Validation failed');
      error.status = 400;
      error.details = errors.array();
      throw error;
    }
    next();
  };


  module.exports = validate;