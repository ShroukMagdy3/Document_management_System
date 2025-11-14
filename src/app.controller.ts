import { config } from "dotenv";
import { resolve } from "path";

function validateEnv() {
  const missing: string[] = [];
  if (!process.env.DB_MONGO) missing.push('DB_MONGO');
  if (!process.env.DB_URL) missing.push('DB_URL');
  if (!process.env.DB_HOST) missing.push('DB_HOST');
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}. Make sure config/.env exists and contains these values.`);
  }
}

// Load env file relative to project root (process.cwd())
config({ path: resolve(process.cwd(), 'config', '.env') });

import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { checkConnection, checkMongo, checkSync, isSequelizeConnected } from "./DB/connectionDb";
import { AppError } from "./utilities/classError";
import userRouter from "./module/users/user.controller";
import workspaceRouter from "./module/workspace/workspace.controller";
import "./utilities/merging";
import { sequelize } from "./DB/connectionDb";
import mongoose from "mongoose";

const app: express.Application = express();

export const createApp = async (): Promise<express.Application> => {
  app.use(express.json());
  app.use(helmet());
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "token"],
    })
  );

  app.options("*", cors()); 
  // Validate required env vars before attempting any DB connections
  validateEnv();
  await checkConnection();
  await checkSync();
  await checkMongo();

  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/workspaces", workspaceRouter);

  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "welcome to Document Management system" });
  });

  app.get("/health", async (req: Request, res: Response) => {
    const uptime = process.uptime();
    const mysqlUp = isSequelizeConnected();
    const mongo = mongoose.connection.readyState === 1;

    return res.status(200).json({
      uptime,
      mysql: mysqlUp ? "up" : "down",
      mongo: mongo ? "up" : "down",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new AppError(`URL not found ,Invalid URL ${req.originalUrl}`, 404);
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    return res.status(500).json({ message: err.message, stack: err.stack });
  });

  return app;
};

export default createApp;
