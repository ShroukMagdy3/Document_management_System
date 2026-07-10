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
  _id: Types.ObjectId; 
  workspaceId: Types.ObjectId;
  name: String;
  type: typeEnum;
  parentId: Types.ObjectId | null;
  ancestors: Types.ObjectId[];
  previewUrl: String;
  secureUrl: String;
  resourceType: String;
  mimeType?: String;
  size?: number;
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
    type: {
      type: String,
      enum: Object.values(typeEnum),
      default: typeEnum.file,
      required: true,
    },
    // null/undefined parentId means the item lives at the root of the workspace (Drive-like)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    // materialized path of ancestor folder ids (root-first), used for fast
    // subtree queries (find all descendants of a folder) without recursion
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    previewUrl: { type: String },
    secureUrl: {
      type: String,
      // folders don't have an actual stored file, only real files do
      required: function (this: IDocument) {
        return this.type !== typeEnum.folder;
      },
    },
    resourceType: {
      type: String,
      required: function (this: IDocument) {
        return this.type !== typeEnum.folder;
      },
    },
    mimeType: { type: String },
    size: { type: Number, default: 0 },
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
DocumentSchema.index({ workspaceId: 1, parentId: 1 });
DocumentSchema.index({ ancestors: 1 });

export const DocumentModel = (mongoose.models.Document as mongoose.Model<IDocument>) || mongoose.model<IDocument>("Document", DocumentSchema);

