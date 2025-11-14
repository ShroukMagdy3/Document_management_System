/*
  Runtime-safe TypeScript declaration merging for Express Request.
  This file provides the same type augmentation as the previous `merging.d.ts`
  but is a .ts module so Node can import it at runtime without error.
  Keep this file side-effect free (no runtime imports) to avoid early DB init.
*/

declare global {
  namespace Express {
    interface Request {
      user?: any;
      decode?: any;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
      file?: Express.Multer.File;
    }
  }
}

export {};
