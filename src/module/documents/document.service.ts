import { workspaceModel } from "./../../DB/models/workspace.model";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../../utilities/cloudinary";
import { AppError } from "../../utilities/classError";
import { DocumentModel } from "../../DB/models/document.model";
import { v4 as uuidv4 } from "uuid";


export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, type } = req.body;
  const { workspaceId } = req.params;
  const nid = req?.user.nid!;
  if (!workspaceId) {
    throw new AppError("workspaceID is Required", 404);
  }
  if (!req.files || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }
  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
    _id: workspaceId,
  });

  if (!workspace) {
    throw new AppError("You must create workspace first", 404);
  }
  const uploadedFiles = req.files as Express.Multer.File[];
  const uploadResults = await Promise.all(
    uploadedFiles.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: `keeply/users/${workspace.userNID}/${type}`,
        public_id: `${file.originalname}-${uuidv4()}`,
      })
    )
  );

  const attachmentsToAdd = uploadResults.map((r) => ({
    public_url: r.public_id,
    secure_url: r.secure_url,
  }));

 const document = await DocumentModel.findOneAndUpdate(
  { ownerNID: nid, name, type, workspaceId },
  { $addToSet: { attachments: { $each: attachmentsToAdd } } },
  { new: true, upsert: true }
);
  res.status(200).json({
    message: "Files uploaded successfully",
    document,
  });
};
