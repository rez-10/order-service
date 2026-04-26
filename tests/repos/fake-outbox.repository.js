export class FakeOutboxRepository {
  constructor() {
    this.events = [];
    this.fail = false;
    this.failNext = false;
  }

  async add(event) {
    if (this.fail || this.failNext) {
      this.failNext = false;
      throw new Error("Outbox write failed");
    }
    this.events.push(event);
  }
}
