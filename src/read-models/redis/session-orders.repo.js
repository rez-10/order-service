export class SessionOrdersRedisRepo {
  constructor({ redisInfra }) {
    this.redis = redisInfra;
  }

  key(sessionId) {
    return `session:${sessionId}:orders`;
  }

  async upsert(sessionId, order) {
    return this.redis.exec((client) =>
      client.hSet(this.key(sessionId), order.orderId, JSON.stringify(order))
    );
  }

  async getBySession(sessionId, { cursor = "0", limit = 20 } = {}) {
    return this.redis.exec(async (client) => {
      const [nextCursor, entries] = await client.hScan(this.key(sessionId), cursor, {
        COUNT: limit,
      });

      const orders = [];
      for (let i = 0; i < entries.length; i += 2) {
        orders.push(JSON.parse(entries[i + 1]));
      }

      return {
        data: orders,
        nextCursor: nextCursor !== "0" ? nextCursor : null,
      };
    });
  }
}
//:: schema reistry - evoltuion and validation
