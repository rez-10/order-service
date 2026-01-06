export class FakeClock {
  constructor(now = Date.now()) {
    this.nowValue = now;
  }

  now() {
    return this.nowValue;
  }
}
