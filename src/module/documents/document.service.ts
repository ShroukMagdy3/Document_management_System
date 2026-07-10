import {
  fileSchema,
  freezeSchemaType,
  updateDocSchemaType,
  createFolderSchemaType,
  moveSchemaType,
} from "./document.validation";
import { workspaceModel } from "./../../DB/models/workspace.model";
import { AppError } from "../../utilities/classError";
import {
  AccessControlEnum,
  DocumentModel,
  IDocument,
  typeEnum,
} from "../../DB/models/document.model";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../../utilities/cloudinary";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import fs from "fs";

const buildPreviewUrl = (uploadResult: {
  resource_type: string;
  public_id: string;
  format?: string;
}): string => {
  const { resource_type, public_id, format } = uploadResult;
  try {
    if (resource_type === "image") {
      return cloudinary.url(public_id, {
        resource_type: "image",
        ...(format === "pdf" ? { format: "jpg", page: 1 } : {}),
        width: 200,
        height: 200,
        crop: "thumb",
      });
    }
    if (resource_type === "video") {
      return cloudinary.url(public_id, {
        resource_type: "video",
        format: "jpg",
        start_offset: "0.5",
        width: 200,
        height: 200,
        crop: "thumb",
      });
    }
  } catch {
  }
  return "";
};

export const extractCloudinaryPublicId = (secureUrl?: string | null): string | null => {
  if (!secureUrl) return null;
  try {
    const afterUpload = secureUrl.split("/upload/")[1];
    if (!afterUpload) return null;
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "");
    return withoutExtension;
  } catch {
    return null;
  }
};


const resolveWorkspace = async (nid: string, workspaceId?: string | null) => {
  if (workspaceId) {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      throw new AppError("Invalid workspace id", 400);
    }
    const workspace = await workspaceModel.findOne({ _id: workspaceId, userNID: nid });
    if (!workspace) {
      throw new AppError("Workspace not found or you are unauthorized", 404);
    }
    return workspace as typeof workspace & { _id: mongoose.Types.ObjectId };
  }
  const workspace = await workspaceModel.findOne({ userNID: nid }).sort({ createdAt: 1 });
  if (!workspace) {
    throw new AppError("No workspace found", 404);
  }
  return workspace as typeof workspace & { _id: mongoose.Types.ObjectId };
};

const cleanupTempFile = (filePath?: string) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore cleanup errors
    }
  }
};

export const getAllDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspaceId } = req.query as { workspaceId?: string };
  const workspace = await resolveWorkspace(req.user.nid, workspaceId);

  const docs = await DocumentModel.find({
    ownerNID: req.user.nid,
    workspaceId: workspace._id,
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
  const doc = await DocumentModel.findOne({
    _id: docId,
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

  const doc = await DocumentModel.findOne({
    _id: docId,
    ownerNID: req.user.nid,
  });
  if (!doc) {
    throw new AppError("not found", 404);
  }

  // if it's a folder, permanently delete every file/folder inside it too
  let idsToDelete: mongoose.Types.ObjectId[] = [doc._id as mongoose.Types.ObjectId];
  if (doc.type === typeEnum.folder) {
    const descendants = await DocumentModel.find(
      { ancestors: doc._id },
      { _id: 1 }
    );
    idsToDelete = idsToDelete.concat(descendants.map((d) => d._id as mongoose.Types.ObjectId));
  }

  const filesToDelete = await DocumentModel.find({
    _id: { $in: idsToDelete },
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
        // asset might already be gone / not on cloudinary (e.g. local pdf) - ignore
      }
    }
  }

  await DocumentModel.deleteMany({ _id: { $in: idsToDelete } });

  return res.status(200).json({ message: "Success", deletedCount: idsToDelete.length });
};

export const freezeDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params as freezeSchemaType;

  const doc = await DocumentModel.findOne({
    _id: docId,
    ownerNID: req.user.nid,
    deletedAt: { $exists: false },
  });
  if (!doc) {
    throw new AppError("this Doc not found or already freezed");
  }

  let idsToFreeze: mongoose.Types.ObjectId[] = [doc._id as mongoose.Types.ObjectId];
  if (doc.type === typeEnum.folder) {
    const descendants = await DocumentModel.find(
      { ancestors: doc._id, deletedAt: { $exists: false } },
      { _id: 1 }
    );
    idsToFreeze = idsToFreeze.concat(descendants.map((d) => d._id as mongoose.Types.ObjectId));
  }

  await DocumentModel.updateMany(
    { _id: { $in: idsToFreeze } },
    { deletedAt: new Date(), deletedBy: req.user.nid }
  );

  return res.status(200).json({ message: "freezed", count: idsToFreeze.length });
};

export const unfreezeDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params;

  const doc = await DocumentModel.findOne({
    _id: docId,
    ownerNID: req.user.nid,
    deletedAt: { $exists: true },
  });
  if (!doc) {
    throw new AppError("this Doc not found or already freezed");
  }

  let idsToRestore: mongoose.Types.ObjectId[] = [doc._id as mongoose.Types.ObjectId];
  if (doc.type === typeEnum.folder) {
    const descendants = await DocumentModel.find(
      { ancestors: doc._id, deletedAt: { $exists: true } },
      { _id: 1 }
    );
    idsToRestore = idsToRestore.concat(descendants.map((d) => d._id as mongoose.Types.ObjectId));
  }

  await DocumentModel.updateMany(
    { _id: { $in: idsToRestore } },
    {
      $unset: { deletedAt: "", deletedBy: "" },
      $set: { restoreAt: new Date(), restoreBy: req.user.nid },
    }
  );

  return res.status(200).json({ message: "unFreezed", count: idsToRestore.length });
};

export const cycleBin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { workspaceId } = req.query as { workspaceId?: string };
  const workspace = await resolveWorkspace(req.user.nid, workspaceId);

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
  const { workspaceId } = req.query as { workspaceId?: string };
  const workspace = await resolveWorkspace(req.user.nid, workspaceId);

  const documents = await DocumentModel.find({
    ownerNID: req.user.nid,
    workspaceId: workspace._id,
    deletedAt: { $exists: false },
  }).sort({ createdAt: -1 });
  return res.status(200).json({ message: "success", documents });
};


export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, type, workspaceId } = req.query as {
    name?: string;
    type?: string;
    workspaceId?: string;
  };
  const workspace = await resolveWorkspace(req.user.nid, workspaceId);

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
  const docs = await DocumentModel.find({ workspaceId: workspace._id, deletedAt: { $exists: false }, ...query });

  if (docs.length == 0) {
    throw new AppError("There is no document for this");

  }
  res.status(200).json({
    message: "success",
    documents: docs,
  });

};


const resolveParentFolder = async (
  parentId: string | null | undefined,
  workspaceId: mongoose.Types.ObjectId
) => {
  if (!parentId) return null;
  const parent = await DocumentModel.findOne({
    _id: parentId,
    workspaceId,
    type: typeEnum.folder,
    deletedAt: { $exists: false },
  });
  if (!parent) throw new AppError("Parent folder not found", 404);
  return parent;
};

export const createFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid;
  const { name, parentId, workspaceId } = req.body as createFolderSchemaType;

  const workspace = await resolveWorkspace(nid, workspaceId);

  const parent = await resolveParentFolder(parentId, workspace._id);

  const existing = await DocumentModel.findOne({
    workspaceId: workspace._id,
    parentId: parent ? parent._id : null,
    name,
    type: typeEnum.folder,
    deletedAt: { $exists: false },
  });
  if (existing) throw new AppError("A folder with this name already exists here", 409);

  const folder = await DocumentModel.create({
    ownerNID: nid,
    workspaceId: workspace._id,
    name,
    type: typeEnum.folder,
    parentId: parent ? parent._id : null,
    ancestors: parent ? [...parent.ancestors, parent._id] : [],
  });

  return res.status(201).json({ message: "success", folder });
};

// Generic single-file upload (any mimetype), optionally placed inside a folder.
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid!;
  const file = req.file as Express.Multer.File;
  if (!file) throw new AppError("No file uploaded", 400);

  const { parentId, workspaceId } = req.body as { parentId?: string | null; workspaceId?: string };

  const workspace = await resolveWorkspace(nid, workspaceId);

  const parent = await resolveParentFolder(parentId, workspace._id);

  const uploadResult = await cloudinary.uploader.upload(file.path, {
    folder: `keeply/users/${req.user.id}`,
    public_id: `${uuidv4()}-${file.originalname}`,
    resource_type: "auto",
  });

  const previewUrl = buildPreviewUrl(uploadResult);

  const document = await DocumentModel.create({
    ownerNID: nid,
    workspaceId: workspace._id,
    name: file.originalname,
    type: typeEnum.file,
    parentId: parent ? parent._id : null,
    ancestors: parent ? [...parent.ancestors, parent._id] : [],
    secureUrl: uploadResult.secure_url,
    resourceType: uploadResult.resource_type,
    mimeType: file.mimetype,
    size: file.size,
    previewUrl,
  });

  cleanupTempFile(file.path);

  return res.status(201).json({ message: "success", document });
};

export const openDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid;
  const { docId } = req.params;

  const doc = await DocumentModel.findOne({
    _id: docId,
    ownerNID: nid,
    type: typeEnum.file,
    deletedAt: { $exists: false },
  });
  if (!doc) throw new AppError("Document not found", 404);

  return res.redirect(doc.secureUrl as unknown as string);
};

// Force-download a document with its original name, regardless of file type.
// Streams the file through the server so the correct filename/Content-Type
// are always set, instead of depending on any local/persistent disk storage.
export const downloadDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid;
  const { docId } = req.params;

  const doc = await DocumentModel.findOne({
    _id: docId,
    ownerNID: nid,
    type: typeEnum.file,
    deletedAt: { $exists: false },
  });
  if (!doc) throw new AppError("Document not found", 404);

  const fileResponse = await fetch(doc.secureUrl as unknown as string);
  if (!fileResponse.ok || !fileResponse.body) {
    throw new AppError("Unable to fetch file for download", 502);
  }
  const arrayBuffer = await fileResponse.arrayBuffer();

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(doc.name as unknown as string)}"`
  );
  res.setHeader(
    "Content-Type",
    (doc.mimeType as unknown as string) || "application/octet-stream"
  );
  return res.status(200).send(Buffer.from(arrayBuffer));
};


export const uploadFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid!;
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) throw new AppError("No files uploaded", 400);

  let paths: string[];
  try {
    paths = typeof req.body.paths === "string" ? JSON.parse(req.body.paths) : req.body.paths;
  } catch {
    paths = req.body.paths;
  }
  if (!Array.isArray(paths) || paths.length !== files.length) {
    files.forEach((f) => cleanupTempFile(f.path));
    throw new AppError(
      "'paths' must be a JSON array of relative paths matching the 'files' count",
      400
    );
  }

  const { parentId, workspaceId } = req.body as { parentId?: string | null; workspaceId?: string };

  const workspace = await resolveWorkspace(nid, workspaceId);

  const rootParent = await resolveParentFolder(parentId, workspace._id);


  type FolderRef = { id: mongoose.Types.ObjectId | null; ancestors: mongoose.Types.ObjectId[] };
  const folderCache = new Map<string, FolderRef>();
  folderCache.set("", {
    id: rootParent ? rootParent._id : null,
    ancestors: rootParent ? [...rootParent.ancestors, rootParent._id] : [],
  });

  const ensureFolderPath = async (segments: string[]): Promise<FolderRef> => {
    let key = "";
    let current = folderCache.get("")!;
    for (const seg of segments) {
      const nextKey = key ? `${key}/${seg}` : seg;
      let next = folderCache.get(nextKey);
      if (!next) {
        let folderDoc = await DocumentModel.findOne({
          workspaceId: workspace._id,
          parentId: current.id,
          name: seg,
          type: typeEnum.folder,
          deletedAt: { $exists: false },
        });
        if (!folderDoc) {
          folderDoc = await DocumentModel.create({
            ownerNID: nid,
            workspaceId: workspace._id,
            name: seg,
            type: typeEnum.folder,
            parentId: current.id,
            ancestors: current.ancestors,
          });
        }
        next = { id: folderDoc._id, ancestors: [...current.ancestors, folderDoc._id] };
        folderCache.set(nextKey, next);
      }
      current = next;
      key = nextKey;
    }
    return current;
  };

  const createdDocuments = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = String(paths[i] || file.originalname)
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    const segments = relativePath.split("/").filter(Boolean);
    const fileName = segments.pop() || file.originalname;
    const folderInfo = await ensureFolderPath(segments);

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: `keeply/users/${req.user.id}`,
      public_id: `${uuidv4()}-${fileName}`,
      resource_type: "auto",
    });

    const previewUrl = buildPreviewUrl(uploadResult);

    const document = await DocumentModel.create({
      ownerNID: nid,
      workspaceId: workspace._id,
      name: fileName,
      type: typeEnum.file,
      parentId: folderInfo.id,
      ancestors: folderInfo.ancestors,
      secureUrl: uploadResult.secure_url,
      resourceType: uploadResult.resource_type,
      mimeType: file.mimetype,
      size: file.size,
      previewUrl,
    });

    cleanupTempFile(file.path);
    createdDocuments.push(document);
  }

  return res.status(201).json({
    message: "success",
    uploaded: createdDocuments.length,
    documents: createdDocuments,
  });
};

export const listContents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const nid = req.user.nid;
  const { parentId, workspaceId } = req.query as { parentId?: string; workspaceId?: string };

  const workspace = await resolveWorkspace(nid, workspaceId);

  const parent = await resolveParentFolder(parentId, workspace._id);

  const items = await DocumentModel.find({
    workspaceId: workspace._id,
    parentId: parent ? parent._id : null,
    deletedAt: { $exists: false },
  }).sort({ type: -1, name: 1 }); // folders ("folder" > "file") before files, then alphabetical

  let breadcrumb: { id: mongoose.Types.ObjectId; name: any }[] = [];
  if (parent) {
    const ancestorIds = [...parent.ancestors, parent._id];
    const ancestorDocs = await DocumentModel.find({ _id: { $in: ancestorIds } });
    const byId = new Map(ancestorDocs.map((d) => [String(d._id), d]));
    breadcrumb = ancestorIds.map((id) => ({
      id,
      name: byId.get(String(id))?.name,
    }));
  }

  return res.status(200).json({
    message: "success",
    currentFolder: parent,
    breadcrumb,
    items,
  });
};

// Move a file or a whole folder (with its subtree) to a different parent folder.
export const moveDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params;
  const { parentId } = req.body as moveSchemaType;

  const doc = await DocumentModel.findOne({
    _id: docId,
    ownerNID: req.user.nid,
    deletedAt: { $exists: false },
  });
  if (!doc) throw new AppError("Document not found", 404);

  let target = null;
  let newAncestors: mongoose.Types.ObjectId[] = [];
  if (parentId) {
    if (String(parentId) === String(doc._id)) {
      throw new AppError("Cannot move a folder into itself", 400);
    }
    target = await resolveParentFolder(parentId, doc.workspaceId as mongoose.Types.ObjectId);
    if (doc.type === typeEnum.folder && target) {
      const targetChain = [...target.ancestors, target._id].map(String);
      if (targetChain.includes(String(doc._id))) {
        throw new AppError("Cannot move a folder into one of its own subfolders", 400);
      }
    }
    newAncestors = target ? [...target.ancestors, target._id] : [];
  }

  doc.parentId = target ? target._id : null;
  (doc.ancestors as any) = newAncestors;
  await doc.save();

  if (doc.type === typeEnum.folder) {
    const descendants = await DocumentModel.find({ ancestors: doc._id });
    for (const desc of descendants) {
      const idx = desc.ancestors.findIndex((a) => String(a) === String(doc._id));
      const suffix = idx >= 0 ? desc.ancestors.slice(idx) : [doc._id];
      (desc.ancestors as any) = [...newAncestors, ...suffix];
      await desc.save();
    }
  }

  return res.status(200).json({ message: "success", document: doc });
};