import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";
import { ErrorResponse } from "../response/ErrorResponse.js";
import { logger } from "../logger/index.js";

const isDev = process.env.NODE_ENV !== "production";

export const errorHandler = (err, req, res, next) => {
  let handledError = err;

  // 1️⃣ Normalize unknown errors
  if (!(handledError instanceof AppError)) {
    handledError = new AppError({
      message: "Internal server error",
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_UNEXPECTED_ERROR,
      meta: {
        originalError: err?.message,
      },
    });
  }

  const code = handledError.code || ERROR_CODES.INTERNAL_UNEXPECTED_ERROR;

  // 2️⃣ Log with correct severity
  if (code.startsWith("INFRA_")) {
    logger.error(
      {
        err: handledError, // 👈 stack captured here
        requestId: req.requestId,
        meta: handledError.meta,
      },
      "Infrastructure error"
    );
  } else if (code.startsWith("DOMAIN_")) {
    logger.warn(
      {
        err: handledError,
        requestId: req.requestId,
        meta: handledError.meta,
      },
      "Domain rule violation"
    );
  } else {
    logger.info(
      {
        err: handledError,
        requestId: req.requestId,
        meta: handledError.meta,
      },
      "Application error"
    );
  }

  // 3️⃣ Dev-only console output
  if (isDev) {
    console.error("Request failed", {
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
      statusCode: handledError.statusCode,
      code: handledError.code,
      stack: handledError.stack,
    });
  }

  // 4️⃣ Stable client response
  res.status(handledError.statusCode).json(ErrorResponse(handledError));
};
