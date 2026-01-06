export class CompletedOrdersQueryRepo {
  constructor({ redisInfra }) {
    this.redis = redisInfra;
  }

  key() {
    return "orders:completed";
  }

  async getCompleted({ offset = 0, limit = 50 } = {}) {
    return this.redis.exec(async (client) => {
      const entries = await client.zRange(this.key(), offset, offset + limit - 1, {
        WITHSCORES: true,
      });

      const data = [];
      for (let i = 0; i < entries.length; i += 2) {
        data.push({
          orderId: entries[i],
          completedAt: new Date(Number(entries[i + 1])).toISOString(),
        });
      }

      return {
        data,
        nextOffset: entries.length === limit * 2 ? offset + limit : null,
      };
    });
  }
}
