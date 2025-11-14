import { NextFunction, Request, Response } from "express";

import { ZodType } from "zod";
import { AppError } from "../utilities/classError";

type reqType =  "body" | "params" | "query" 
type schemaType = Partial<Record<reqType, ZodType>>;


export const validation = (schema: schemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let validationError = [];
    for (const key of Object.keys(schema) as reqType[]) {
      if (!schema[key]) continue;
      const res = schema[key].safeParse(req[key]);
      if (!res.success) {
        validationError.push(res.error);
      }
    }
    if (validationError.length) {
      throw new AppError(JSON.parse(validationError as unknown as string));
    }
    next();
  };
};
