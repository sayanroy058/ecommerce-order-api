const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        logger.warn(`Validation Error: ${message}`);
        return res.status(400).json({
            success: false,
            error: message
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        logger.warn('Duplicate field value entered');
        return res.status(400).json({
            success: false,
            error: 'Duplicate field value entered'
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        logger.warn(`Invalid ObjectId: ${err.value}`);
        return res.status(404).json({
            success: false,
            error: 'Resource not found'
        });
    }

    // General server error
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
};

const handleServiceError = (service, error) => {
    // Log the error with service name
    console.error(`${service} service error: ${error.message}`);
    
    // Check if it's a timeout error
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return new Error(`${service} service timed out. Please try again later.`);
    }
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new Error(`Unable to connect to ${service} service. Please try again later.`);
    }
    
    // Default error response
    return new Error(`${service} service encountered an error. Please try again later.`);
  };

module.exports = errorHandler;
