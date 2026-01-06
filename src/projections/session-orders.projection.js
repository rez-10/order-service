export class SessionOrdersProjection {
  constructor({ repo }) {
    this.repo = repo;
  }

  async onOrderCreated(event) {
    const { orderId, sessionId } = event.payload;

    await this.repo.upsert(sessionId, {
      orderId,
      status: "CREATED",
      createdAt: event.occurredAt,
    });
  }

  async onOrderStatusUpdated(event, status) {
    const { orderId } = event.payload;

    // sessionId must be embedded in payload or metadata
    const sessionId = event.metadata.sessionId;

    await this.repo.upsert(sessionId, {
      orderId,
      status,
      updatedAt: event.occurredAt,
    });
  }
}
