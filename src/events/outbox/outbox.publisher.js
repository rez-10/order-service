import { ErrorStore } from "../../shared/index.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

export class OutboxPublisher {
  constructor({ kafkaProducer, schemaRegistry, topicResolver }) {
    this.producer = kafkaProducer;
    this.schemaRegistry = schemaRegistry;
    this.topicResolver = topicResolver;
  }

  async publish(event) {
    const { eventType, payload, version = "latest" } = event;

    const subject = `${eventType}-value`;
    const topic = this.topicResolver.resolve(eventType);

    try {
      const schema = await this.schemaRegistry.getSchema(subject, version);

      this.schemaRegistry.validate(schema, payload);
    } catch (err) {
      throw ErrorStore.infra(
        ERROR_CODES.INFRA_SCHEMA_REGISTRY_TIMEOUT,
        "Event schema validation failed",
        {
          eventType,
          details: err.details || err.message,
        }
      );
    }

    await this.producer.send(topic, [
      {
        key: event.aggregateId,
        value: JSON.stringify(payload),
        headers: {
          eventType,
          version: String(version),
        },
      },
    ]);
  }
}
