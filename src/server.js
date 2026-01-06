import http from "http";

if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}

/* ---------- config ---------- */
import { loadConfig } from "./config/index.js";


/* ---------- container & app ---------- */
import { createContainer } from "./container/container.js";
import { createApp } from "./app.js";

/* ---------- process signals ---------- */
const SHUTDOWN_SIGNALS = ["SIGTERM", "SIGINT"];

/**
 * main
 *
 * Process entrypoint.
 * Owns lifecycle.
 */
async function main() {
  /* ============================================================
   * 1. Load config (fail fast)
   * ============================================================ */
  const config = loadConfig();

  /* ============================================================
   * 2. Create container (pure wiring)
   * ============================================================ */
  const container = createContainer(config);
  const { logger, infra } = container;

  /* ============================================================
   * 3. Connect critical infrastructure
   * ============================================================ */
  try {
    logger.info("Connecting Redis...");
    await infra.redis.client.connect();

    logger.info("Checking Redis health...");
    await infra.redis.health();

    logger.info("Checking Postgres health...");
    await infra.postgres.health();
  } catch (err) {
    logger.fatal(
      { err },
      "Critical infrastructure failed during startup. Exiting."
    );
    process.exit(1);
  }

  /* ============================================================
   * 4. Create HTTP app
   * ============================================================ */
  const app = createApp(container);
  const server = http.createServer(app);

  /* ============================================================
   * 5. Start HTTP server
   * ============================================================ */
  const PORT = config.http?.port || 3000;

  await new Promise((resolve) => {
    server.listen(PORT, () => {
      logger.info({ port: PORT }, "HTTP server started");
      resolve();
    });
  });

  /* ============================================================
   * 6. Start non-critical background processes
   * ============================================================ */
  try {
    logger.info("Starting Kafka consumers...");
    for (const consumer of Object.values(container.events.consumers)) {
      await consumer.start();
    }

    logger.info("Starting outbox dispatcher...");
    container.events.dispatcher.start();
  } catch (err) {
    logger.error(
      { err },
      "Background processes failed to start (service still accepting traffic)"
    );
  }

  /* ============================================================
   * 7. Graceful shutdown
   * ============================================================ */
  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "Shutdown initiated");

    try {
      /* 1️⃣ Stop accepting new HTTP requests */
      await new Promise((resolve) => server.close(resolve));
      logger.info("HTTP server closed");

      /* 2️⃣ Stop background jobs */
      if (container.events.dispatcher?.stop) {
        await container.events.dispatcher.stop();
        logger.info("Outbox dispatcher stopped");
      }

      /* 3️⃣ Stop Kafka consumers */
      for (const consumer of Object.values(container.events.consumers)) {
        if (consumer.stop) {
          await consumer.stop();
        }
      }
      logger.info("Kafka consumers stopped");

      /* 4️⃣ Close Redis */
      if (infra.redis.client.isOpen) {
        await infra.redis.client.quit();
        logger.info("Redis connection closed");
      }

      /* 5️⃣ Close Postgres */
      await infra.postgres.pool.end();
      logger.info("Postgres pool closed");

      logger.info("Shutdown completed cleanly");
      process.exit(0);
    } catch (err) {
      logger.error(
        { err },
        "Error during shutdown, forcing exit"
      );
      process.exit(1);
    }
  }

  SHUTDOWN_SIGNALS.forEach((signal) => {
    process.on(signal, shutdown);
  });

  process.on("unhandledRejection", (err) => {
    logger.fatal({ err }, "Unhandled promise rejection");
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    shutdown("uncaughtException");
  });
}

/* ============================================================
 * Boot
 * ============================================================ */
main().catch((err) => {
  console.error("Fatal error during startup", err);
  process.exit(1);
});
