export class FakeOrderRepository {
  constructor() {
    this.store = new Map();
  }

  async save(order) {
    this.store.set(order.id, order);
  }

  async getById(orderId) {
    return this.store.get(orderId) || null;
  }
}
