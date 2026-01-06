import { baseLogger } from "./baseLogger.js";

export const createLogger = (bindings = {}) => {
  return baseLogger.child(bindings);
};

/*
Redis client:
import { createLogger } from "../shared/logger/index.js";
const log = createLogger({ component: "redis-client" });
log.error({ err }, "Redis unavailable");

Outbox dispatcher:
const log = createLogger({ component: "outbox-dispatcher" });
log.info("Dispatching outbox events");
 */
