export class FakeCommandDedupRepository {
  constructor() {
    this.seen = new Set();
  }

  async exists(commandId) {
    return this.seen.has(commandId);
  }

  async save(commandId) {
    this.seen.add(commandId);
  }
}
