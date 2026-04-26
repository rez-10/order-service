// // tests/fakes/fake-unit-of-work.js
// export class FakeUnitOfWork {
//   constructor() {
//     this.transactions = [];
//   }

//   async withTransaction(fn) {
//     const tx = {}; // opaque transaction object
//     this.transactions.push(tx);
//     return await fn(tx);
//   }
// }

export class FakeUnitOfWork {
  constructor() {
    this.committed = false;
    this.rolledBack = false;
    this.transactions = [];
  }

  async withTransaction(fn) {
    const tx = {};
    this.transactions.push(tx);

    try {
      const result = await fn(tx);
      this.committed = true;
      return result;
    } catch (error) {
      this.rolledBack = true;
      throw error;
    }
  }
}
