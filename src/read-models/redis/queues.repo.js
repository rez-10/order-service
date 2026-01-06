export class QueuesRedisRepo {
  constructor({ redisInfra }) {
    this.redis = redisInfra;
  }

  async add(queueKey, orderId, score) {
    return this.redis.exec((client) =>
      client.zAdd(queueKey, {
        score,
        value: orderId,
      })
    );
  }

  async remove(queueKey, orderId) {
    return this.redis.exec((client) => client.zRem(queueKey, orderId));
  }

  async getQueue(queueKey, { offset = 0, limit = 50 } = {}) {
    return this.redis.exec(async (client) => {
      const entries = await client.zRange(queueKey, offset, offset + limit - 1, {
        WITHSCORES: true,
      });

      const data = [];
      for (let i = 0; i < entries.length; i += 2) {
        data.push({
          orderId: entries[i],
          timestamp: new Date(Number(entries[i + 1])).toISOString(),
        });
      }

      return {
        data,
        nextOffset: entries.length === limit * 2 ? offset + limit : null,
      };
    });
  }
}
