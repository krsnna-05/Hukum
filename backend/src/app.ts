import express, { Express, NextFunction, Request, Response } from "express";
import cardRoutes from "./routes/cardRoutes";
import roomRoutes from "./routes/roomRoutes";

const app: Express = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Hukum API" });
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
