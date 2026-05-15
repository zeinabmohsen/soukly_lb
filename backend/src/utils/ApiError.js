const httpStatus = require("http-status");

class APIError extends Error {
  constructor(messageOrOptions, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false) {
    const isObj = typeof messageOrOptions === "object";
    super(isObj ? messageOrOptions.message : messageOrOptions);
    this.name = this.constructor.name;
    this.status = isObj ? (messageOrOptions.status ?? httpStatus.INTERNAL_SERVER_ERROR) : status;
    this.isPublic = isObj ? (messageOrOptions.isPublic ?? false) : isPublic;
    this.errors = isObj ? messageOrOptions.errors : undefined;
    this.isOperational = true;
    if (isObj && messageOrOptions.stack) this.stack = messageOrOptions.stack;
  }
}

module.exports = APIError;
