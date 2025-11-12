import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { validation } from "../../middleware/validation";
import {
  confirmEmailSchema,
  signInSchema,
  signUpSchema,
} from "./user.validation";
import * as US from "./user.service";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import { MulterCloud, validationFileType } from "../../middleware/multer";

const userRouter = Router();

userRouter.post("/signUp", validation({ body: signUpSchema }), US.signUp);
userRouter.post(
  "/confirmEmail",
  validation({ body: confirmEmailSchema }),
  US.confirmEmail
);
userRouter.post("/signIn", validation({ body: signInSchema }), US.signIn);
userRouter.get("/getProfile", Authentication(tokenEnum.access), US.getProfile);
userRouter.post(
  "/uploadProfile",
  Authentication(tokenEnum.access),
  MulterCloud({ fileTypes: validationFileType.image }).single("attachment"),
  US.uploadProfile
);

userRouter.post ("/logout" , Authentication(tokenEnum.access) , US.logout)


export default userRouter;
