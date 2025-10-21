import { Request, NextFunction, Response } from "express";
import { RoleEnum } from "../DB/models/users.model";
import { AppError } from "../utilities/classError";

export const Authorization = ({ role }:{role: RoleEnum}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!role.includes(req.user?.role! as RoleEnum)) {
      throw new AppError("Unauthorized", 401);
    }
    return next();
  };
};