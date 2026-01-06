// http/middlewares/command-metadata.js
import { ErrorStore } from "../../shared/index.js";
import { validate as isUUID } from "uuid";

/**
 * Command Metadata Middleware
 *
 * Applies ONLY to command (write) routes.
 *
 * Responsibilities:
 * - Enforce presence of X-Command-Id
 * - Validate commandId format
 * - Build command metadata from request + auth context
 *
 * Must NOT:
 * - Touch DB
 * - Perform idempotency checks
 */
export const commandMetadataMiddleware = (req, res, next) => {
  const commandId = req.headers["x-command-id"];

  if (!commandId) {
    return next(ErrorStore.validation("Missing X-Command-Id header"));
  }

  if (!isUUID(commandId)) {
    return next(ErrorStore.validation("Invalid X-Command-Id (must be UUID)"));
  }

  req.commandMetadata = {
    commandId,
    source: req.authContext.source,
    actorId: req.authContext.actorId,
    actorRole: req.authContext.actorRole,
  };

  next();
};
