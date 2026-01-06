/**
 * Order Item Entity
 *
 * Immutable snapshot at time of ordering
 */
export class OrderItem {
  constructor({ id, orderId, itemId, quantity, price, tax, createdAt }) {
    this.id = id;
    this.orderId = orderId;
    this.itemId = itemId;
    this.quantity = quantity;
    this.price = price;
    this.tax = tax;
    this.createdAt = createdAt;
  }
}
