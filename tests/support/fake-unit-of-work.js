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
  constructor({ orderRepo, orderItemRepo, dedupRepo, outboxRepo }) {
    this.orderRepo = orderRepo;
    this.orderItemRepo = orderItemRepo;
    this.dedupRepo = dedupRepo;
    this.outboxRepo = outboxRepo;
  }

  async withTransaction(fn) {
    return fn({
      orders: this.orderRepo,
      orderItems: this.orderItemRepo,
      commandDedup: this.dedupRepo,
      outbox: this.outboxRepo
    });
  }
}
