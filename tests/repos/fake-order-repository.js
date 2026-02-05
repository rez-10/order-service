export class FakeOrderRepository {
  constructor() {
    this.store = new Map();
    this.created = [];
  }

  async create(order) {
    this.created.push(order);
    this.store.set(order.id, { ...order });
  }

  async getById(orderId) {
    return this.store.get(orderId) || null;
  }

  async updateStatus(orderId, status, updatedAt) {
    const existing = this.store.get(orderId);
    if (!existing) return;
    this.store.set(orderId, { ...existing, status, updatedAt });
  }

  async findById(orderId) {
    return this.getById(orderId);
  }
}
