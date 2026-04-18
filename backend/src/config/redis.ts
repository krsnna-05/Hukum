import { createClient } from "redis";

const isProduction = (process.env.NODE_ENV ?? "development") === "production";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

if (isProduction && !process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required in production.");
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting");
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};
