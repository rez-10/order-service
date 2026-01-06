export class AppError extends Error {
  constructor({ message, statusCode, code, meta = {} }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // semantic prefix encodes meaning
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }
}
