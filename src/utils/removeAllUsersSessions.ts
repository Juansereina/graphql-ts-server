import { Redis } from "ioredis";
import { userSessionIdPrefix, redisSessionPrefix } from "../constants";

export const removeAllUsersSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  );
  const redisPipeline = redis.multi();
  sessionIds.forEach((key: string) => {
    redisPipeline.del(`${redisSessionPrefix}${key}`);
  });
  await redisPipeline.exec(err => {
    if (err) {
      console.log(err);
    }
  });
};
