export class OrderDetailRedisRepo {
  constructor({ redisInfra }) {
    this.redis = redisInfra;
  }

  key(orderId) {
    return `order:${orderId}:detail`;
  }

  async set(orderId, doc) {
    return this.redis.exec((client) => client.set(this.key(orderId), JSON.stringify(doc)));
  }

  async get(orderId) {
    return this.redis.exec(async (client) => {
      const val = await client.get(this.key(orderId));
      return val ? JSON.parse(val) : null;
    });
  }
}
