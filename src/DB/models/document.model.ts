import mongoose, { Document, Types } from "mongoose";
import { WorkspaceCategoryEnum } from "./workspace.model";

interface Attachment {
  _id: string;
  public_url: string;
  secure_url: string;
}
export enum AccessControlEnum {
  private ="private", 
  public ="public"
}

export interface IDocument extends Document {
  workspaceId: Types.ObjectId;
  attachments: Attachment[];
  name: string;
  ownerNID: string;
  type: WorkspaceCategoryEnum;
  deletedBy:string;
  deletedAt:Date
  restoreAt:Date;
  restoreBy:string
  createdAt: Date;
  updatedAt: Date;
  accessControl:AccessControlEnum
}

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Workspace",
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum:WorkspaceCategoryEnum,
      required: true,
    },
    ownerNID: {
      type: String,
      minlength: 14,
      maxlength: 14,
      required: true,
    },
 attachments: [
    {
      public_url: String,
      secure_url: String
    }
  ],
   deletedAt: {
      type: Date,
    },
    deletedBy :{
      type:String,
      maxLength:14,
      minlength:14
    },
    restoreAt:{
       type: Date,
    },
    restoreBy:{
      type:String
    },
    accessControl:{
      type:String,
      enum:AccessControlEnum,
      default:AccessControlEnum.public
    }
  }
  ,{
    timestamps: true,
  }
);

DocumentSchema.index({ name: 1 });
DocumentSchema.index({ type: 1 });

export const DocumentModel =
  mongoose.model<IDocument>("Document", DocumentSchema) ||
  mongoose.models.Document;
