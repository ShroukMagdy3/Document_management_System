import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { validation } from "../../middleware/validation";
import { confirmEmailSchema, signInSchema, signUpSchema } from "./user.validation";
import * as US from "./user.service";

const userRouter = Router()

userRouter.post("/signUp" , validation({body:signUpSchema}) ,US.signUp )
userRouter.post("/confirmEmail" , validation({body:confirmEmailSchema}) ,US.confirmEmail )
userRouter.post("/signIn" , validation({body:signInSchema}) ,US.signIn );

export default userRouter;