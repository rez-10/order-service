import { randomUUID } from "crypto";

/**
 * Request ID Middleware
 *
 * Responsibilities:
 * - Ensure every request has a requestId
 * - Prefer gateway-provided ID
 *
 * Must NOT:
 * - Validate auth
 * - Generate business identifiers
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.requestId = requestId;

  // propagate downstream
  res.setHeader("X-Request-Id", requestId);

  next();
};
