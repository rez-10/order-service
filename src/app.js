import express from "express";
import cors from "cors";

/* ---------- middlewares ---------- */
import { requestIdMiddleware } from "./http/middlewares/request-id.js";
import { authContextMiddleware } from "./http/middlewares/auth-context.js";
import { commandMetadataMiddleware } from "./http/middlewares/command-metadata.js";

/* ---------- routes ---------- */
import { createRoutes } from "./http/routes.js";

/* ---------- error handling ---------- */
import { errorHandler } from "./shared/errors/errorHandler.js";

/**
 * createApp
 *
 * Pure HTTP composition.
 * No infra, no lifecycle, no side effects.
 */
export function createApp(container) {
  const app = express();

  /* ---------- core ---------- */
  app.disable("x-powered-by");

  /* ---------- CORS (explicit, gateway-friendly) ---------- */
  app.use(
    cors({
      // origin: container.config.http?.corsOrigin || false,
      credentials: true
    })
  );

  /* ---------- body parsing ---------- */
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  /* ---------- request context ---------- */
  app.use(requestIdMiddleware);        // correlation
  app.use(authContextMiddleware);      // actor identity
  app.use(commandMetadataMiddleware);  // commandId + idempotency

  /* ---------- routes ---------- */
  app.use(
    "/",
    createRoutes({
      commands: container.commands,
      queries: container.http.queries,
      logger: container.logger
    })
  );

  /* ---------- error boundary ---------- */
  app.use(errorHandler);

  return app;
}
