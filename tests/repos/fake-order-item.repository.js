export class FakeOrderItemRepository {
  constructor() {
    this.items = [];
  }

  async bulkCreate(items) {
    items.forEach((item) => {
      this.items.push({ ...item });
    });
  }

  async getByOrderId(orderId) {
    return this.items.filter(i => i.orderId === orderId);
  }
}
