import { Router } from "express";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import * as WS from "./workspace.service";
import { Authorization } from "../../middleware/authorization";
import { RoleEnum } from "../../DB/models/users.model";
import { validation } from "../../middleware/validation";
import { createWorkSpaceSchema, updateSchema } from "./workspace.validation";

const workspaceRouter = Router();


workspaceRouter.post( "/createWorkspace" , Authentication(tokenEnum.access) , validation({body: createWorkSpaceSchema}), WS.createWorkspace )
workspaceRouter.get("/getAll",Authentication(tokenEnum.access) ,Authorization({role : RoleEnum.admin}), WS.getAllWorkspaces)
workspaceRouter.get("/getOne/:id" , Authentication(tokenEnum.access), WS.getWorkspace)
workspaceRouter.delete("/deleteWorkspace/:id" , Authentication(tokenEnum.access), WS.deleteWorkspace)
workspaceRouter.patch("/update/:id" , Authentication(tokenEnum.access), validation({body:updateSchema}), WS.updateWorkspace)

export default workspaceRouter;