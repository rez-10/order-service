export class FakeCommandDedupRepository {
  constructor() {
    this.seen = new Set();
    this.records = [];
  }

  async exists(commandId) {
    return this.seen.has(commandId);
  }

  async record(entry) {
    this.seen.add(entry.commandId);
    this.records.push(entry);
  }
}
