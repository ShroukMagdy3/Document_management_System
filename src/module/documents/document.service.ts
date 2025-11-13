import streamifier from "streamifier";
import {
  fileSchema,
  freezeSchemaType,
  updateDocSchemaType,
} from "./document.validation";
import { workspaceModel } from "./../../DB/models/workspace.model";
import { AppError } from "../../utilities/classError";
import {
  AccessControlEnum,
  DocumentModel,
  typeEnum,
} from "../../DB/models/document.model";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../../utilities/cloudinary";
import { Request, Response, NextFunction } from "express";

import path from "path";
import fs from "fs";

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid!;
  const file = req.file as Express.Multer.File;
  if (!file) throw new AppError("No file uploaded", 400);

  if (!file.mimetype.startsWith("image/")) {
    throw new AppError("Not an image file", 400);
  }

  const workspace = await workspaceModel.findOne({ userNID: nid });

  const uploadResult = await cloudinary.uploader.upload(file.path, {
    folder: `keeply/users/${req.user.id}`,
    public_id: `${uuidv4()}-${file.originalname}`,
    resource_type: "image",
  });

  const previewUrl = cloudinary.url(uploadResult.public_id, {
    resource_type: "image",
    width: 200,
    height: 200,
    crop: "thumb",
  });

  const document = await DocumentModel.create({
    ownerNID: nid,
    name: file.originalname,
    type: typeEnum.file,
    workspaceId: workspace?._id,
    secureUrl: uploadResult.secure_url,
    resourceType: uploadResult.resource_type,
    previewUrl: previewUrl,
  });

  res.status(200).json({
    message: "success",
    document,
  });
};

export const uploadPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workspace = await workspaceModel.findOne({ userNID: req.user.nid });
  if (!workspace) throw new AppError("No workspace found", 400);

  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const uploadsFolder = path.join(__dirname, "../../../uploads");
  if (!fs.existsSync(uploadsFolder))
    fs.mkdirSync(uploadsFolder, { recursive: true });

  const serverFileName = `${uuidv4()}-${file.originalname}`;
  const serverFilePath = path.join(uploadsFolder, serverFileName);

  fs.copyFileSync(file.path, serverFilePath);
  fs.unlinkSync(file.path);

  const secureUrl = `/uploads/${serverFileName}`;

  const previewResult = await cloudinary.uploader.upload(serverFilePath, {
    folder: `keeply/users/${req.user.id}/previews`,
    public_id: `${uuidv4()}-preview-${file.originalname}`,
    resource_type: "image",
    pages:true
  });

  const previewUrl = previewResult.secure_url;

  const document = await DocumentModel.create({
    ownerNID: req.user.nid,
    name: file.originalname,
    workspaceId: workspace._id,
    resourceType: "pdf",
    secureUrl,
    previewUrl,
  });

  res.status(200).json({ message: "success", document });
};

export const openPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const doc = await DocumentModel.findOne({ _id: req.params.id });
  if (!doc) return next(new AppError("Document not found", 404));
  const fileName = doc.secureUrl.split("/").pop();
  const filePath = path.join(__dirname, "../../../uploads", fileName!);
  res.sendFile(filePath);
};

export const downloadPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const doc = await DocumentModel.findById(req.params.id);
  if (!doc) return next(new AppError("Document not found", 404));

  const fileName = doc.name.toString();
  const secure = doc.secureUrl.toString();

  const filePath = path.join(
    __dirname,
    "../../../uploads",
    path.basename(secure)
  );

  res.download(filePath, fileName, (err) => {
    if (err) {
      throw new AppError("Error while downloading file", 500);
    }
  });
};

export const uploadVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid!;
  const file = req.file as Express.Multer.File;
  if (!file) throw new AppError("No file uploaded", 400);

  const workspace = await workspaceModel.findOne({ userNID: nid });

  const uploadResult = await cloudinary.uploader.upload(file.path, {
    folder: `keeply/users/${req.user.id}`,
    public_id: `${uuidv4()}-${file.originalname}`,
    resource_type: "video",
  });

  const previewUrl = cloudinary.url(uploadResult.public_id, {
    resource_type: "video",
    format: "jpg",
    start_offset: "0.5",
    width: 200,
    height: 200,
    crop: "thumb",
  });

  const document = await DocumentModel.create({
    ownerNID: nid,
    name: file.originalname,
    type: typeEnum.file,
    workspaceId: workspace?._id,
    secureUrl: uploadResult.secure_url,
    resourceType: "video",
    previewUrl: previewUrl,
  });
  res.status(200).json({
    message: "success",
    document,
  });
};

export const uploadAudio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid!;
  const file = req.file as Express.Multer.File;
  if (!file) throw new AppError("No file uploaded", 400);

  const workspace = await workspaceModel.findOne({ userNID: nid });

  const uploadResult = await cloudinary.uploader.upload(file.path, {
    folder: `keeply/users/${req.user.id}`,
    public_id: `${uuidv4()}-${file.originalname}`,
    resource_type: "raw",
  });

  const previewUrl = "";

  const document = await DocumentModel.create({
    ownerNID: nid,
    name: file.originalname,
    type: typeEnum.file,
    workspaceId: workspace?._id,
    secureUrl: uploadResult.secure_url,
    resourceType: "audio",
    previewUrl: previewUrl,
  });

  res.status(200).json({
    message: "success",
    document,
  });
};

export const getAllDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("Workspace not found or you are unauthorized", 404);
  }

  const docs = await DocumentModel.find({
    ownerNID: req.user.nid,
    deletedBy: { $exists: false },
  });
  if (!docs.length) {
    return res
      .status(404)
      .json({ message: "No documents found", attachments: [] });
  }

  return res.status(200).json({ message: "Success", documents: docs });
};

export const updateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params;
  const { name } = req.body;
  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("no workspaces", 404);
  }
  const doc = await DocumentModel.findOne({
    _id: docId,
    workspaceId: workspace._id,
    ownerNID: req.user.nid,
  });
  if (!doc) {
    throw new AppError("not found");
  }
  if (!name) {
    throw new AppError("there is no thing to update");
  }

  doc.name = name;
  await doc.save();
  return res.status(200).json({ message: "Success", doc });
};

export const deleteDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params;

  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("no workspaces", 404);
  }
  const doc = await DocumentModel.deleteOne({
    _id: docId,
    workspaceId: workspace._id,
    ownerNID: req.user.nid,
  });
  if (!doc) {
    throw new AppError("not found");
  }

  return res.status(200).json({ message: "Success" });
};

export const freezeDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params as freezeSchemaType;

  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("no workspaces", 404);
  }
  const doc = await DocumentModel.findOneAndUpdate(
    {
      _id: docId,
      workspaceId: workspace._id,
      ownerNID: req.user.nid,
      deletedAt: { $exists: false }, 
    },
    {
      deletedAt: new Date(),
      deletedBy: req.user.nid,
    },
    { new: true }
  );
  if (!doc) {
    throw new AppError("this Doc not found or already freezed");
  }

  return res.status(200).json({ message: "freezed" });
};

export const unfreezeDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params;

  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("no workspaces", 404);
  }
 const doc = await DocumentModel.findOneAndUpdate(
    {
      _id: docId,
      workspaceId: workspace._id,
      ownerNID: req.user.nid,
      deletedAt: { $exists: true }, 
    },
    {
      $unset: { deletedAt: "", deletedBy: "" },
      $set: { restoreAt: new Date(), restoreBy: req.user.nid },
    },
    { new: true }
  );

  if (!doc) {
    throw new AppError("this Doc not found or already freezed");
  }

  return res.status(200).json({ message: "unFreezed" });
};

export const cycleBin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workspace = await workspaceModel.findOne({
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("no workspaces", 404);
  }
  const documents = await DocumentModel.find({
    ownerNID: req.user.nid,
    workspaceId: workspace._id,
    deletedBy: { $exists: true },
    deletedAt: { $exists: true },
  });
  if (!documents) {
    throw new AppError("No freezed Documents", 404);
  }

  return res.status(200).json({ message: "success", documents });
};

export const sortDesc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const documents = await DocumentModel.find({
    ownerNID: req.user.nid,
    deletedAt: { $exists: false },
  }).sort({ createdAt: -1 });
  return res.status(200).json({ message: "success", documents });
};


export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, type } = req.query;
 const workspace = await workspaceModel.findOne({ userNID: req.user.nid });
if (!workspace) {
  throw new AppError("no workspace");
}

const query: {
  name?: { $regex: string; $options: string };
  resourceType?: string;
} = {};

if (name) {
  query.name = { $regex: name as string, $options: "i" };
}
if (type) {
  query.resourceType = type as string;
}
const docs = await DocumentModel.find({workspaceId:workspace._id , deletedAt:{$exists :false}, ...query});

if(docs.length == 0) {
  throw new AppError("There is no document for this");
  
}
res.status(200).json({
  message: "success",
  documents: docs,
});

};
