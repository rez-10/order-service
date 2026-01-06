import { ErrorStore } from "../../shared/index.js";

/**
 * Auth Context Middleware
 *
 * Contract:
 * - All requests are authenticated at API Gateway
 * - Identity headers are mandatory
 *
 * Responsibilities:
 * - Normalize actor identity
 * - Enforce presence of auth headers
 * - Attach auth context to request
 *
 * Must NOT:
 * - Validate tokens
 * - Check permissions
 * - Call external services
 */
export const authContextMiddleware = (req, res, next) => {
  const actorId = req.headers["x-user-id"];
  const actorRole = req.headers["x-user-role"];
  const source = req.headers["x-source"];

  // Enforce gateway contract strictly
  if (!actorId) {
    return next(ErrorStore.unauthorized("Missing X-User-Id header"));
  }

  if (!actorRole) {
    return next(ErrorStore.unauthorized("Missing X-User-Role header"));
  }

  if (!source) {
    return next(ErrorStore.validation("Missing X-Source header"));
  }

  /**
   * Attach normalized auth context
   * Used ONLY for observability & audit
   */
  req.authContext = {
    actorId,
    actorRole,
    source,
  };

  next();
};
/**
 * In app.js or equivalent:
 * app.use(requestIdMiddleware);        // sets req.requestId
 * app.use(authMiddleware);             // validates auth, sets req.user
 * app.use(authContextMiddleware);      // extracts actor context
 * app.use(commandMetadataMiddleware);  // enforces X-Command-Id etc
 * app.use(routes);

 */
/*
app.use(requestIdMiddleware);        // correlation
app.use(authContextMiddleware);      // identity normalization
app.use(commandMetadataMiddleware);  // idempotency + command metadata
app.use(routes);

 */
