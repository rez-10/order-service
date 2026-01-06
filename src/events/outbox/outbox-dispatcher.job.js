/**
 * OutboxDispatcher
 *
 * Responsibilities:
 * - Poll unpublished outbox rows
 * - Invoke OutboxPublisher
 * - Mark rows as published
 *
 * Does NOT:
 * - Know Kafka
 * - Know schemas
 * - Know event semantics
 */
export class OutboxDispatcher {
  constructor({
    outboxRepository,
    outboxPublisher,
    unitOfWork,
    logger,
    pollIntervalMs = 1000,
    batchSize = 50,
  }) {
    this.outboxRepository = outboxRepository;
    this.outboxPublisher = outboxPublisher;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
    this.pollIntervalMs = pollIntervalMs;
    this.batchSize = batchSize;
    this._running = false;
  }

  start() {
    this._running = true;
    this.logger.info("Outbox dispatcher started");
    this._loop();
  }

  stop() {
    this._running = false;
    this.logger.info("Outbox dispatcher stopped");
  }

  async _loop() {
    while (this._running) {
      try {
        await this._dispatchOnce();
      } catch (err) {
        this.logger.error({ err }, "Outbox dispatcher iteration failed");
      }

      await this._sleep(this.pollIntervalMs);
    }
  }

  async _dispatchOnce() {
    await this.unitOfWork.withTransaction(async (client) => {
      // 1️⃣ Lock unpublished rows
      const events = await this.outboxRepository.fetchUnpublished(
        { limit: this.batchSize },
        { client }
      );

      if (!events.length) return;

      for (const event of events) {
        // 2️⃣ Publish (schema + kafka handled inside)
        await this.outboxPublisher.publish(event);

        // 3️⃣ Mark published
        await this.outboxRepository.markPublished(event.id, { client });

        this.logger.info(
          {
            eventId: event.id,
            eventType: event.eventType,
            aggregateId: event.aggregateId,
          },
          "Outbox event published"
        );
      }
    });
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
