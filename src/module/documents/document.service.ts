import {
  downloadSchemaType,
  fileSchema,
  uploadFileSchema,
} from "./document.validation";
import { workspaceModel } from "./../../DB/models/workspace.model";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../../utilities/cloudinary";
import { AppError } from "../../utilities/classError";
import { DocumentModel } from "../../DB/models/document.model";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, type } = uploadFileSchema.parse(req.body);
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

export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { DocumentId  , workspaceId ,fileId}  = req.params as downloadSchemaType ;

  if(!DocumentId){
    throw new AppError("File ID is required" ,404)
  }
  const workspace = await workspaceModel.findOne({_id:workspaceId});
  if(!workspace){
    throw new AppError("workspace not found" , 404)
  }

  const doc = await DocumentModel.findOne({_id:DocumentId})
  if(!doc){
    throw new AppError("there this no document" , 404)
  }

  const attachment = doc.attachments.find((att)=>{
    return att._id.toString() === fileId
  })
   if (!attachment || !attachment.public_url) {
      return res.status(404).json({ message: "Attachment URL not found" });
    }
    const fileUrl = attachment.secure_url;
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });


    res.setHeader("Content-Disposition", `attachment;"`);
    res.setHeader("Content-Type", response.headers["content-type"]);
    return res.send(response.data)
};
