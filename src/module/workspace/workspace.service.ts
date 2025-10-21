import { Request, Response, NextFunction } from "express";
import User from "../../DB/models/users.model";
import { AppError } from "../../utilities/classError";
import { workspaceModel } from "../../DB/models/workspace.model";
import { createWorkSpaceSchemaType, updateSchemaType } from "./workspace.validation";

export const createWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userNID, name, description, category }: createWorkSpaceSchemaType =
    req.body;
  const user = await User.findOne({ where: { nid: userNID } });
  if (!user) {
    throw new AppError("not found", 404);
  }

  const workspace = await workspaceModel.create({
    userNID: req.user.nid,
    name,
    description,
    category,
  });

  return res
    .status(201)
    .json({ message: "Workspace created successfully", workspace });
};
export const getAllWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { page = 1, limit = 5 } = req.query as unknown as {
    page: number;
    limit: number;
  };
  if (page < 0) page = 1;
  page = page * 1;
  const skip = (page - 1) * limit;
  const workspaces = await workspaceModel.find().skip(skip).limit(limit);
  const numberOfWorkspaces = await workspaceModel.countDocuments();
  if (!workspaces) {
    throw new AppError("not found", 404);
  }
  return res
    .status(201)
    .json({ message: "Workspaces", numberOfWorkspaces, workspaces });
};
export const getWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("workspaceID is required");
  }
  const userNId = req.user.nid;
  const workspace = await workspaceModel.findOne({ _id: id, userNID: userNId });
  if (!workspace) {
    throw new AppError("There is no workspace or unauthorized", 404);
  }
  return res
    .status(201)
    .json({ message: "Workspace fetched successfully", workspace });
};
export const deleteWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("workspaceID is required");
  }
  const userNID = req.user.nid;
 const workspace = await workspaceModel.findOneAndDelete({
    _id: id,        
    userNID: userNID, 
  });
  if (!workspace) {
    throw new AppError("this workspace not found or you are unauthorized");
  }

  return res.status(200).json({ message: "deleted successfully" });
};

export const updateWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const {description , name , category} :updateSchemaType = req.body
  if (!id) {
    throw new AppError("workspaceID is required");
  }
  const userNID = req.user.nid;
 const workspace = await workspaceModel.findOne({
    _id: id,        
    userNID: userNID, 
  });
  if (!workspace) {
    throw new AppError("this workspace not found or you are unauthorized");
  }
  if(description){
    workspace.description = description;
  }
  if(name){
    workspace.name = name
  }

  if(category){
    workspace.category = category
  }
  await workspace.save();
  return res.status(200).json({ message: "updated successfully" , workspace});
};