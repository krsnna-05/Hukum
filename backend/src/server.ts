import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { connectRedis, disconnectRedis } from "./config/redis";
import { initSocketServer } from "./socket/realtime";

const PORT = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectRedis();

    const httpServer = createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  try {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    await disconnectRedis();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
