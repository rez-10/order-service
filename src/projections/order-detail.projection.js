export class OrderDetailProjection {
  constructor({ repo }) {
    this.repo = repo;
  }

  async onOrderCreated(event) {
    const { orderId, sessionId } = event.payload;

    await this.repo.set(orderId, {
      orderId,
      sessionId,
      status: "CREATED",
      items: [],
      createdAt: event.occurredAt,
    });
  }

  async onItemsAdded(event) {
    const { orderId, items } = event.payload;
    const doc = await this.repo.get(orderId);
    if (!doc) return;

    await this.repo.set(orderId, {
      ...doc,
      items: [...doc.items, ...items],
    });
  }

  async onStatusUpdated(event, status) {
    const { orderId } = event.payload;
    const doc = await this.repo.get(orderId);
    if (!doc) return;

    await this.repo.set(orderId, {
      ...doc,
      status,
    });
  }
}
