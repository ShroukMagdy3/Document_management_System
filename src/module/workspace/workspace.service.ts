import { Request, Response, NextFunction } from "express";
import User from "../../DB/models/users.model";
import { AppError } from "../../utilities/classError";
import { workspaceModel } from "../../DB/models/workspace.model";
import { updateSchemaType, createWorkspaceSchemaType } from "./workspace.validation";
import { DocumentModel, typeEnum } from "../../DB/models/document.model";
import cloudinary from "../../utilities/cloudinary";
import { extractCloudinaryPublicId } from "../documents/document.service";


export const createWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body as createWorkspaceSchemaType;
  const workspace = await workspaceModel.create({
    userNID: req.user.nid,
    name,
    documents: [],
  });
  return res.status(201).json({ message: "success", workspace });
};

export const listWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid;
 
  const workspaces = await workspaceModel.aggregate([
    {
      $match: { userNID: nid },
    },
    {
      $lookup: {
        from: DocumentModel.collection.name, 
        let: { workspaceId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$workspaceId", "$$workspaceId"] },
              deletedAt: { $exists: false },
            },
          },
          { $count: "count" },
        ],
        as: "itemsCountResult",
      },
    },
    {
      $addFields: {
        itemsCount: {
          $ifNull: [{ $arrayElemAt: ["$itemsCountResult.count", 0] }, 0],
        },
      },
    },
    {
      $project: {
        itemsCountResult: 0,
      },
    },
    {
      $sort: { createdAt: 1 },
    },
  ]);
 
  return res.status(200).json({
    message: "success",
    workspaces,
  });
};

export const deleteWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid;
  const { id } = req.params;
 
  const workspace = await workspaceModel.findOne({ _id: id, userNID: nid });
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }
 
  const remainingCount = await workspaceModel.countDocuments({ userNID: nid });
  if (remainingCount <= 1) {
    return res.status(400).json({ message: "You need at least one workspace" });
  }
 
  await DocumentModel.deleteMany({ workspaceId: workspace._id });
  await workspaceModel.deleteOne({ _id: workspace._id });
 
  return res.status(200).json({
    message: "success",
  });
};

export const getMyWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userNId = req.user.nid;
  const workspace = await workspaceModel
    .findOne({ userNID: req.user.nid })
    .sort({ createdAt: 1 });
  if (!workspace) {
    throw new AppError("There is no workspace!", 404);
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