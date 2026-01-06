export class FakeOutboxRepository {
  constructor() {
    this.events = [];
    this.fail = false;
  }

  async add(event) {
    if (this.fail) {
      throw new Error("Outbox write failed");
    }
    this.events.push(event);
  }
}
