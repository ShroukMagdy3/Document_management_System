import mongoose, { Document } from "mongoose";
import { DocumentModel } from "./document.model";
import { Types } from "mongoose";

export interface IWorkspace extends Document {
  userNID: string;
  name: string;
  documents: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new mongoose.Schema<IWorkspace>(
  {
    userNID: {
      type: String,
      required: true,
      length: 14,
    },
    name: {
      type: String,
      required: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  {
    timestamps: true,
  }
);


export const workspaceModel =
  (mongoose.models.Workspace as mongoose.Model<IWorkspace>) ||
  mongoose.model<IWorkspace>("Workspace", workspaceSchema);
