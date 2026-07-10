import { Router } from "express";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import * as WS from "./workspace.service";
import { Authorization } from "../../middleware/authorization";
import { RoleEnum } from "../../DB/models/users.model";
import { validation } from "../../middleware/validation";
import { updateSchema, createWorkspaceSchema, workspaceIdParamSchema } from "./workspace.validation";
import documentRouter from "../documents/document.controller";
import { catchAsync } from "../../utilities/catchAsync";

const workspaceRouter = Router();
workspaceRouter.use("/documents", documentRouter);

// Create a new workspace (a user can have several: "Personal", "Work", ...)
workspaceRouter.post(
  "/create",
  Authentication(tokenEnum.access),
  validation({ body: createWorkspaceSchema }),
  catchAsync(WS.createWorkspace)
);

// List every workspace owned by the current user
workspaceRouter.get(
  "/list",
  Authentication(tokenEnum.access),
  catchAsync(WS.listWorkspaces)
);

workspaceRouter.get(
  "/getMyWorkspace",
  Authentication(tokenEnum.access),
  catchAsync(WS.getMyWorkspace)
);

workspaceRouter.patch(
  "/update/:id",
  Authentication(tokenEnum.access),
  validation({ params: workspaceIdParamSchema, body: updateSchema }),
  catchAsync(WS.updateWorkspace)
);

workspaceRouter.delete(
  "/delete/:id",
  Authentication(tokenEnum.access),
  validation({ params: workspaceIdParamSchema }),
  catchAsync(WS.deleteWorkspace)
);

export default workspaceRouter;
