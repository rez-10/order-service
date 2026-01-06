export async function checkRedisHealth(redisClient) {
  const result = await redisClient.ping();
  return result === "PONG";
}
