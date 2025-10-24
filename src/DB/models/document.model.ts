import mongoose, { Document, Types } from "mongoose";

interface Attachment {
  _id: string;
  public_url: string;
  secure_url: string;
}

export interface IDocument extends Document {
  workspaceId: Types.ObjectId;
  attachments: Attachment[];
  name: string;
  ownerNID: string;
  type: string;
  deletedBy:string;
  deletedAt:Date
  restoreAt:Date;
  restoreBy:string
  createdAt: Date;
  updatedAt: Date;
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
    }
  }
  ,{
    timestamps: true,
  }
);

export const DocumentModel =
  mongoose.model<IDocument>("Document", DocumentSchema) ||
  mongoose.models.Document;
