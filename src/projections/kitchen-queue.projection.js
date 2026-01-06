export class KitchenQueueProjection {
  constructor({ repo }) {
    this.repo = repo;
    this.key = "queue:kitchen";
  }

  async onOrderConfirmed(event) {
    await this.repo.add(this.key, event.payload.orderId, Date.parse(event.occurredAt));
  }

  async onMealPrepared(event) {
    await this.repo.remove(this.key, event.payload.orderId);
  }
}
