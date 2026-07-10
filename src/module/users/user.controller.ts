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
import { catchAsync } from "../../utilities/catchAsync";

const userRouter = Router();

userRouter.post("/signUp", validation({ body: signUpSchema }), catchAsync(US.signUp));
userRouter.post(
  "/confirmEmail",
  validation({ body: confirmEmailSchema }),
  catchAsync(US.confirmEmail)
);
userRouter.post("/signIn", validation({ body: signInSchema }), catchAsync(US.signIn));
userRouter.get("/getProfile", Authentication(tokenEnum.access), catchAsync(US.getProfile));
userRouter.post(
  "/uploadProfile",
  Authentication(tokenEnum.access),
  MulterCloud({ fileTypes: validationFileType.image }).single("attachment"),
  catchAsync(US.uploadProfile)
);

userRouter.post ("/logout" , Authentication(tokenEnum.access) , catchAsync(US.logout))


export default userRouter;
