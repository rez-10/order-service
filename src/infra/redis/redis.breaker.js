import CircuitBreaker from "opossum";
import { logger } from "../../shared/index.js";

export function createRedisBreaker(redisClient, config) {
  const breaker = new CircuitBreaker(async (fn) => fn(), {
    timeout: config.timeoutMs,
    errorThresholdPercentage: config.errorThresholdPercentage,
    resetTimeout: config.resetTimeoutMs,
  });

  breaker.on("open", () => {
    logger.error("Redis circuit breaker opened");
  });

  breaker.on("halfOpen", () => {
    logger.warn("Redis circuit breaker half-open");
  });

  breaker.on("close", () => {
    logger.info("Redis circuit breaker closed");
  });

  return {
    async exec(operation) {
      return breaker.fire(() => operation(redisClient));
    },
  };
}
