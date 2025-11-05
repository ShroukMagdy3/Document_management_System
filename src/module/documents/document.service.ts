import {
  downloadSchemaType,
  fileSchema,
  freezeSchemaType,
  searchSchemaType,
  updateDocSchemaParamsType,
  updateDocSchemaType,
  uploadFileSchema,
} from "./document.validation";
import { workspaceModel } from "./../../DB/models/workspace.model";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../../utilities/cloudinary";
import { AppError } from "../../utilities/classError";
import {
  AccessControlEnum,
  DocumentModel,
  IDocument,
} from "../../DB/models/document.model";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, type, accessControl } = uploadFileSchema.parse(req.body);
  const attachments = fileSchema.parse(req.files);
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
  const uploadResults = await Promise.all(
    attachments.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: `keeply/users/${workspace.userNID}/${type}`,
        public_id: `${uuidv4()}-${file.originalname}`,
      })
    )
  );

  const attachmentsToAdd = uploadResults.map((r) => ({
    public_url: r.public_id,
    secure_url: r.secure_url,
  }));

  const document = await DocumentModel.findOneAndUpdate(
    { ownerNID: nid, name, type, workspaceId, accessControl },
    { $addToSet: { attachments: { $each: attachmentsToAdd } } },
    { new: true, upsert: true }
  );
  res.status(200).json({
    message: "Files uploaded successfully",
    document,
  });
};

export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { DocumentId, workspaceId, fileId } = req.params as downloadSchemaType;

  if (!DocumentId) {
    throw new AppError("File ID is required", 404);
  }
  const workspace = await workspaceModel.findOne({ _id: workspaceId });
  if (!workspace) {
    throw new AppError("workspace not found", 404);
  }

  const doc = await DocumentModel.findOne({
    workspaceId,
    _id: DocumentId,
    deletedAt: { $exists: false },
    $or: [
      { ownerNID: req.user.nid },
      { accessControl: AccessControlEnum.public },
    ],
  });
  if (!doc) {
    throw new AppError("there this no document", 404);
  }

  const attachment = doc.attachments.find((att) => {
    return att._id.toString() === fileId;
  });
  if (!attachment || !attachment.public_url) {
    return res.status(404).json({ message: "Attachment URL not found" });
  }
  const fileUrl = attachment.secure_url;
  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

  res.setHeader("Content-Disposition", `attachment;"`);
  res.setHeader("Content-Type", response.headers["content-type"]);
  return res.send(response.data);
};

export const getAllDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspaceId } = req.params;
  if (!workspaceId) {
    throw new AppError("workspace ID is required", 400);
  }
  const workspace = await workspaceModel.findOne({
    _id: workspaceId,
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("Workspace not found or you are unauthorized", 404);
  }

  const docs = await DocumentModel.find({
    workspaceId,
    deletedBy: { $exists: false },
    $or: [
      { accessControl: AccessControlEnum.public },
      { ownerNID: req.user.nid },
    ],
  });
  if (!docs.length) {
    return res
      .status(404)
      .json({ message: "No documents found", attachments: [] });
  }

  const allAttachments = docs.reduce<string[]>((acc, current) => {
    acc.push(
      ...current.attachments.map((c) => {
        return c.secure_url;
      })
    );
    return acc;
  }, []);

  return res
    .status(200)
    .json({ message: "Success", attachments: allAttachments });
};

export const freezeDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspaceId, docId } = req.params as freezeSchemaType;

  const workspace = await workspaceModel.findOne({
    _id: workspaceId,
    userNID: req.user.nid,
  });
  console.log(workspace);

  if (!workspace) {
    console.log(req.user.nid);
    throw new AppError("this workspace not found or you are unauthorized", 404);
  }
  const doc = await DocumentModel.findOneAndUpdate(
    {
      _id: docId,
      ownerNID: req.user.nid,
      workspaceId,
      deletedBy: { $exists: false },
    },
    {
      deletedAt: Date.now(),
      deletedBy: req.user.nid,
    }
  );
  if (!doc) {
    throw new AppError("this Doc not found or already freezed", 404);
  }

  return res.status(200).json({ message: "freezed" });
};

export const unfreezeDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspaceId, docId } = req.params as freezeSchemaType;
  const workspace = await workspaceModel.findOne({
    _id: workspaceId,
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("this workspace not found or you are unauthorized", 404);
  }
  const doc = await DocumentModel.findOneAndUpdate(
    {
      _id: docId,
      ownerNID: req.user.nid,
      workspaceId,
      deletedBy: { $exists: true },
    },
    {
      $unset: { deletedAt: "", deletedBy: "" },
      $set: {
        restoreAt: Date.now(),
        restoreBy: req.user.nid,
      },
    }
  );

  if (!doc) {
    throw new AppError("this Doc not found or already unfreeze", 404);
  }
  return res.status(200).json({ message: "unfreeze" });
};
export const preview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId, workspaceId } = req.params as freezeSchemaType;

  const document = await DocumentModel.findOne({ _id: docId });
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const doc = await DocumentModel.findOne({
    _id: docId,
    workspaceId,
    $or: [
      { accessControl: AccessControlEnum.public },
      { ownerNID: req.user.nid },
    ],
  });
  if (!doc) {
    return res.status(403).json({ message: "unauthorized" });
  }

  const fileUrl = doc?.attachments[0]!.secure_url;
  if (!fileUrl) {
    throw new AppError("url not found", 404);
  }

  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
  const base64Data = Buffer.from(response.data, "binary").toString("base64");

  res.status(200).json({
    base64Data: base64Data,
  });
};

export const listDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspaceId } = req.params;
  const workspace = await workspaceModel.findOne({
    _id: workspaceId,
    userNID: req.user.nid,
  });
  if (!workspace) {
    throw new AppError("there is no workspace or you are unauthorized", 404);
  }
  const docs = await DocumentModel.find({
    workspaceId,
    $or: [
      { accessControl: AccessControlEnum.public },
      { ownerNID: req.user.nid },
    ],
  });
  if (docs.length === 0) {
    throw new AppError("there are no docs for you", 404);
  }
  return res.status(200).json({ message: "success", docs });
};

export const searchAndSort = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    type,
    sort = "createdAt",
    order = "desc",
  } = req.query as searchSchemaType;
  const { workspaceId } = req.params;
  if (!name && !type) {
    throw new AppError("you must provide name or type for search", 400);
  }
  let filter: any = {
    workspaceId,
    deletedAt: { $exists: false },
    $or: [
      { accessControl: AccessControlEnum.public },
      { ownerNID: req.user.nid },
    ],
  };
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (type) {
    filter.type = { $regex: type, $options: "i" };
  }
  const doc = await DocumentModel.find(filter).sort({
    [sort]: order === "desc" ? -1 : 1,
  });

  if (!doc) {
    throw new AppError("No documents for you or you are un authorized! ", 400);
  }
  if (doc.length === 0) {
    throw new AppError("there is no documents for you", 400);
  }

  return res.status(200).json({ message: "success", doc });
};
export const getDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId, workspaceId } = req.params;
  if (!docId) {
    throw new AppError("document Id is required", 404);
  }
  const workspace = await workspaceModel.findOne({ _id: workspaceId });
  if (!workspace) {
    throw new AppError("you must create workspace first!");
  }
  const doc = await DocumentModel.findOne({
    _id: docId,
    workspaceId,
    $or: [
      { accessControl: AccessControlEnum.public },
      { ownerNID: req.user.nid },
    ],
    deletedBy: { $exists: false },
  });
  if (!doc) {
    throw new AppError("There is no document for you", 400);
  }
  let attachmentsMetaData: { type: string; url: string }[] = [];
  if (doc.attachments && doc?.attachments.length > 0) {
    for (const obj of doc.attachments) {
      if (obj.public_url) {
        const type = obj.public_url.split(".").pop();
        attachmentsMetaData.push({
          url: obj.secure_url,
          type: type as unknown as string,
        });
      }
    }
  }
  return res
    .status(200)
    .json({ message: "success", document: doc, attachmentsMetaData });
};

export const updateDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId, workspaceId } = req.params as updateDocSchemaParamsType;
  const { type, name, accessControl }: updateDocSchemaType = req.body;

  if (!docId) {
    throw new AppError("document Id is required", 404);
  }
  const workspace = await workspaceModel.findOne({ _id: workspaceId });
  if (!workspace) {
    throw new AppError("you must create workspace first!");
  }
  const doc = await DocumentModel.findOne({
    _id: docId,
    workspaceId,
    deletedBy: { $exists: false },
    ownerNID: req.user.nid,
  });
  if (!doc) {
    throw new AppError("There is no document for you", 400);
  }
  if (type) {
    doc.type = type;
    workspace.category?.push(type);
    await workspace.save();
  }
  if (name) {
    doc.name = name;
  }
  if (accessControl) {
    doc.accessControl = accessControl;
  }
  await doc.save();
  return res.status(200).json({ message: "success", documents: doc });
};
