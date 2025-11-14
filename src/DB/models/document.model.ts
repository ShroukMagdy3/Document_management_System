import mongoose, { Document, Types } from "mongoose";

export enum AccessControlEnum {
  private = "private",
  public = "public",
}
export enum typeEnum {
  file = "file",
  folder = "folder",
}

export interface IDocument extends Document {
  workspaceId: Types.ObjectId;
  name: String;
  previewUrl: String;
  secureUrl: String;
  resourceType: String;
  ownerNID: string;
  deletedBy: string;
  deletedAt: Date;
  restoreAt: Date;
  restoreBy: string;
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
    ownerNID: {
      type: String,
      minlength: 14,
      maxlength: 14,
      required: true,
    },
    name: { type: String, required: true },
    previewUrl: { type: String },
    secureUrl: { type: String, required: true },
    resourceType: { type: String, required: true },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: String,
      maxLength: 14,
      minlength: 14,
    },
    restoreAt: {
      type: Date,
    },
    restoreBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ name: 1 });
DocumentSchema.index({ type: 1 });

export const DocumentModel = (mongoose.models.Document as mongoose.Model<IDocument>) || mongoose.model<IDocument>("Document", DocumentSchema);

