
import User from "../../DB/models/users.model";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
      decode?: JwtPayload;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
      file?: Express.Multer.File;
    }
  }
}

export {};