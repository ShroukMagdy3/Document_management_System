import mongoose, { Document, Types } from "mongoose";

export interface IDocument extends Document {
  workspaceId: Types.ObjectId;
  attachments: string[];
  name: string;
  ownerNID: string;
  type: string;
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
  ]
  },
  {
    timestamps: true,
  }
);

export const DocumentModel =
  mongoose.model<IDocument>("Document", DocumentSchema) ||
  mongoose.models.Document;
