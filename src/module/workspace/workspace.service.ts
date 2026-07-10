import { Request, Response, NextFunction } from "express";
import User from "../../DB/models/users.model";
import { AppError } from "../../utilities/classError";
import { workspaceModel } from "../../DB/models/workspace.model";
import { updateSchemaType, createWorkspaceSchemaType } from "./workspace.validation";
import { DocumentModel, typeEnum } from "../../DB/models/document.model";
import cloudinary from "../../utilities/cloudinary";
import { extractCloudinaryPublicId } from "../documents/document.service";


// Creates an additional workspace for the current user. Users can now own
// as many workspaces as they like (e.g. "Personal", "Work", "Team X").
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

// Lists every workspace owned by the current user, oldest first (the first
// one is treated as their "default" workspace when no workspaceId is given
// on document endpoints).
export const listWorkspaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workspaces = await workspaceModel
    .find({ userNID: req.user.nid })
    .sort({ createdAt: 1 });
  return res.status(200).json({ message: "success", workspaces });
};

// Permanently deletes a workspace the user owns, along with every
// file/folder inside it (and their underlying Cloudinary assets).
export const deleteWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const workspace = await workspaceModel.findOne({
    _id: id,
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("this workspace not found or you are unauthorized", 404);
  }

  const filesToDelete = await DocumentModel.find({
    workspaceId: workspace._id,
    type: typeEnum.file,
  });

  for (const f of filesToDelete) {
    const publicId = extractCloudinaryPublicId(f.secureUrl as string);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: (f.resourceType as string) || "auto",
        });
      } catch {
        // asset might already be gone - ignore
      }
    }
  }

  await DocumentModel.deleteMany({ workspaceId: workspace._id });
  await workspace.deleteOne();

  return res.status(200).json({
    message: "workspace deleted",
    deletedDocuments: filesToDelete.length,
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