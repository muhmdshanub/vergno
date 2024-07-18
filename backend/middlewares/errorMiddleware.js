const notFound = (req, res, next) =>{
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle specific error types
    switch (err.name) {
        case 'ValidationError':
            statusCode = 400; // Bad Request
            break;
        case 'CastError':
            statusCode = 404; // Not Found
            message = 'Resource not found.';
            break;
        case 'SyntaxError':
            statusCode = 400; // Bad Request
            message = 'Invalid JSON';
            break;
        case 'ReferenceError':
            statusCode = 500; // Internal Server Error
            message = 'Internal server error';
            break;
        // Express Errors
        case 'SyntaxError':
            statusCode = 400; // Bad Request
            message = 'Invalid request syntax';
            break;
        case 'MongoError':
            statusCode = 500; // Internal Server Error
            message = 'Database error';
            break;
        // Add more cases for common error types from other modules and libraries
        default:
            // Handle other types of errors
            break;
    }

    // Check if the error originates from an async handler
    if (res.headersSent) {
        // If headers have already been sent, delegate to the default Express error handler
        return next(err);
    }

    // Respond with the error
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler
}