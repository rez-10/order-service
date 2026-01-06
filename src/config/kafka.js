/**
 * Kafka / Redpanda config
 *
 * Pure client configuration.
 * No producer/consumer creation here.
 */
export function createKafkaConfig(env) {
  return {
    client: {
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS.split(",").map((b) => b.trim()),
      connectionTimeout: env.KAFKA_CONN_TIMEOUT_MS,
      requestTimeout: env.KAFKA_REQUEST_TIMEOUT_MS,
    },

    producer: {
      idempotent: env.KAFKA_PRODUCER_IDEMPOTENT,
      maxInFlightRequests: env.KAFKA_PRODUCER_MAX_IN_FLIGHT,
    },

    consumer: {
      groupId: env.KAFKA_CONSUMER_GROUP_ID,
      sessionTimeout: env.KAFKA_CONSUMER_SESSION_TIMEOUT_MS,
      heartbeatInterval: env.KAFKA_CONSUMER_HEARTBEAT_INTERVAL_MS,
    },
  };
}
