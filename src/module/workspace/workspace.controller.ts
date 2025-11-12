import { Router } from "express";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import * as WS from "./workspace.service";
import { Authorization } from "../../middleware/authorization";
import { RoleEnum } from "../../DB/models/users.model";
import { validation } from "../../middleware/validation";
import { updateSchema } from "./workspace.validation";
import documentRouter from "../documents/document.controller";
import { MulterCloud, validationFileType } from "../../middleware/multer";

const workspaceRouter = Router();
workspaceRouter.use("/documents", documentRouter);



workspaceRouter.get(
  "/getMyWorkspace",
  Authentication(tokenEnum.access),
  WS.getMyWorkspace
);

workspaceRouter.patch(
  "/update/:id",
  Authentication(tokenEnum.access),
  validation({ body: updateSchema }),
  WS.updateWorkspace
);

export default workspaceRouter;
