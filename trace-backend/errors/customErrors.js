class BaseError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // To distinguish between operational errors and programming errors
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'The requested resource was not found.') {
    super(message, 404);
  }
}

class BadRequestError extends BaseError {
  constructor(message = 'The server cannot process the request due to a client error.') {
    super(message, 400);
  }
}

class InternalServerError extends BaseError {
    constructor(message = 'An unexpected error occurred on the server.') {
        super(message, 500, false); // This is not an operational error
    }
}

// TODO other common errors 401 UnauthorizedError, 403 ForbiddenError, 409 ConflictError...


module.exports = {
  BaseError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
};
