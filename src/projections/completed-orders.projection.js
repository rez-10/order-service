export class CompletedOrdersProjection {
  constructor({ repo }) {
    this.repo = repo;
    this.key = "orders:completed";
  }

  async onOrderCompleted(event) {
    await this.repo.add(this.key, event.payload.orderId, Date.parse(event.occurredAt));
  }
}
