export class FakeRedis {
  constructor() {
    this.down = false;
  }

  async get() {
    if (this.down) {
      throw new Error("Redis unavailable");
    }
    return null;
  }
}
