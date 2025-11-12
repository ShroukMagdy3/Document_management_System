import { Request, Response, NextFunction } from "express";
import { AppError } from "../utilities/classError";
import { verifyToken } from "../utilities/token";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../DB/models/users.model";
import { email } from "zod";
import { RevokeTokenModel } from "../DB/models/revokeToken.model";

export enum tokenEnum {
  refresh = "refresh",
  access = "access"
}

export const Authentication = (tokenType: tokenEnum) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const [prefix, token] = authorization?.split(" ") || [];
    if (!prefix || !token) {
      throw new AppError("invalid token", 401);
    }
    let signature: string = "";
    if (tokenType === tokenEnum.access) {
      if (prefix === process.env.BEARER_USER) {
        signature = process.env.SIGNATURE_access_USER!;
      } else if (prefix == process.env.BEARER_ADMIN) {
        signature = process.env.SIGNATURE_access_ADMIN!;
      }
    } else if (tokenType === tokenEnum.refresh) {
      if (prefix === process.env.BEARER_USER) {
        signature = process.env.SIGNATURE_REFRESH_USER!;
      } else if (prefix == process.env.BEARER_ADMIN) {
        signature = process.env.SIGNATURE_REFRESH_ADMIN!;
      }
    }
    if (!signature) {
      throw new AppError("invalid signature", 401);
    }
    const decode = (await jwt.verify(token, signature)) as JwtPayload;
    if (!decode) {
      throw new AppError("invalid token", 400);
    }

    const user = await User.findOne({
      where: {
        email: decode?.email,
        confirmed: true,
        
      },
      raw: true 
    });
    if (!user) {
      throw new AppError("user not exist", 404);
    }
    if (!user.confirmed) {
      throw new AppError("please confirm email");
    }
     const revokeToken = await RevokeTokenModel.findOne({ token : decode.jti });
      if (revokeToken) {
        throw new Error("you must login again" ,{cause:403});
      }
      
    
    
    req.user = user;
    req.decode =decode;

    return next();
  };
};
