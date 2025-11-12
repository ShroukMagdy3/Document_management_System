import { Request, Response, NextFunction } from "express";
import User from "../../DB/models/users.model";
import { AppError } from "../../utilities/classError";
import { workspaceModel } from "../../DB/models/workspace.model";
import { updateSchemaType } from "./workspace.validation";


export const getMyWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userNId = req.user.nid;
  const workspace = await workspaceModel.findOne({ userNID: userNId });
  if (!workspace) {
    throw new AppError("There is no workspace ", 404);
  }
  return res
    .status(201)
    .json({ message: "success", workspace });
};

export const updateWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name } :updateSchemaType = req.body
  if (!id) {
    throw new AppError("workspaceID is required");
  }
 const workspace = await workspaceModel.findOne({
    _id: id,        
    userNID: req.user.nid, 
  });
  if (!workspace) {
    throw new AppError("this workspace not found or you are unauthorized");
  }
  if(name){
    workspace.name = name
  }

  
  await workspace.save();
  return res.status(200).json({ message: "updated successfully" , workspace});
};