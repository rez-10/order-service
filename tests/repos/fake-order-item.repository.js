export class FakeOrderItemRepository {
  constructor() {
    this.items = [];
  }

  async addMany(orderId, items) {
    items.forEach(item => {
      this.items.push({ orderId, ...item });
    });
  }

  async getByOrderId(orderId) {
    return this.items.filter(i => i.orderId === orderId);
  }
}
