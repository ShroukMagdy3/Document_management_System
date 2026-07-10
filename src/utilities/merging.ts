

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
