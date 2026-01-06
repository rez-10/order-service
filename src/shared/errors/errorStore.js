import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";

/**
 * ErrorStore
 *
 * Factory for AppError instances.
 * Classification is derived from ERROR_CODE prefix.
 */
export const ErrorStore = {
  validation(message = "Validation failed", meta = {}) {
    return new AppError({
      message,
      statusCode: 400,
      code: ERROR_CODES.APP_VALIDATION_FAILED,
      meta,
    });
  },

  notFound(message = "Resource not found", meta = {}) {
    return new AppError({
      message,
      statusCode: 404,
      code: ERROR_CODES.APP_NOT_FOUND,
      meta,
    });
  },

  conflict(message = "Conflict", meta = {}) {
    return new AppError({
      message,
      statusCode: 409,
      code: ERROR_CODES.APP_CONFLICT,
      meta,
    });
  },

  domain(code, message, meta = {}) {
    return new AppError({
      message,
      statusCode: 422, // semantic domain rejection
      code,
      meta,
    });
  },

  infra(code, message, meta = {}) {
    return new AppError({
      message,
      statusCode: 503, // service unavailable
      code,
      meta,
    });
  },

  internal(message = "Internal server error", meta = {}) {
    return new AppError({
      message,
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_UNEXPECTED_ERROR,
      meta,
    });
  },
};
