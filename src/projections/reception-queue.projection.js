export class ReceptionQueueProjection {
  constructor({ repo }) {
    this.repo = repo;
    this.key = "queue:reception";
  }

  async onOrderCreated(event) {
    await this.repo.add(this.key, event.payload.orderId, Date.parse(event.occurredAt));
  }

  async onOrderConfirmed(event) {
    await this.repo.remove(this.key, event.payload.orderId);
  }
}
