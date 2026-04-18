import express, { Express, NextFunction, Request, Response } from "express";
import { redisClient } from "./config/redis";
import { getAllowedOrigins, isOriginAllowed } from "./config/env";
import cardRoutes from "./routes/cardRoutes";
import roomRoutes from "./routes/roomRoutes";

const app: Express = express();
const allowedOrigins = getAllowedOrigins();

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (isOriginAllowed(requestOrigin, allowedOrigins)) {
    if (requestOrigin) {
      res.header("Access-Control-Allow-Origin", requestOrigin);
    } else if (allowedOrigins.includes("*")) {
      res.header("Access-Control-Allow-Origin", "*");
    }
  }

  res.header("Vary", "Origin");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (!isOriginAllowed(requestOrigin, allowedOrigins)) {
    res.status(403).json({ error: "CORS origin denied." });
    return;
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

// Middleware
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Hukum API" });
});

app.get("/api/health", (req: Request, res: Response) => {
  void req;
  res.status(200).json({
    status: "ok",
    redisConnected: redisClient.isOpen,
  });
});

app.use("/api/cards", cardRoutes);
app.use("/cards", cardRoutes);
app.use("/api/rooms", roomRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  void req;
  void next;
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
