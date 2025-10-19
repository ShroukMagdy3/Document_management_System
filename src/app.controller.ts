import { config } from "dotenv";
import path, { resolve } from "path";
config({ path: resolve("./config/.env") });



import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";


const app: express.Application = express();
const port: string | number = process.env.PORT || 5000;
const limiter = rateLimit({
  max: 10,
  windowMs: 5 * 60 * 1000,
  message: {
    error: "too many requests",
  },
  statusCode: 429,
  legacyHeaders: false,
});


const bootstrap = async () => {
  app.use(express.json());
   app.use(helmet());
  app.use(cors());
  app.use(limiter);


  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res
      .status(200)
      .json({ message: "welcome to Document Management system" });
  });
  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new Error(`404 not found URL ,Invalid URL ${req.originalUrl}`);
  });
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    return res
      .status((err.cause as unknown as number) || 500)
      .json({ message: err.message, stack: err.stack });
  });
  app.listen(port, () => {
    console.log(`server is running on ${port} `);
  });
};

export default bootstrap;
