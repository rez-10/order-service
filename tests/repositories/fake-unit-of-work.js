// export class FakeUnitOfWork {
//   constructor() {
//     this.committed = false;
//     this.rolledBack = false;
//   }

//   async withTransaction(fn) {
//     try {
//       await fn({});
//       this.committed = true;
//     } catch (err) {
//       this.rolledBack = true;
//       throw err;
//     }
//   }
// }
// tests/fakes/fake-unit-of-work.js
export class FakeUnitOfWork {
  constructor() {
    this.transactions = [];
  }

  async withTransaction(fn) {
    const tx = {}; // opaque transaction object
    this.transactions.push(tx);
    return await fn(tx);
  }
}
