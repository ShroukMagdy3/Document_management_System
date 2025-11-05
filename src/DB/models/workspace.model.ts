import mongoose, { Document } from "mongoose";
import { DocumentModel } from "./document.model";

export enum WorkspaceCategoryEnum {
  school = "school",
  internship = "internship",
  company = "company",
  personal = "personal",
  other = "other",
}

export interface IWorkspace extends Document {
  userNID: string;
  name: string;
  description?: string;
  category?: string[];
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
    description: {
      type: String,
      minlength: 3,
      maxlength: 200,
    },
    category: [
      {
        type: String,
        enum: Object.keys(WorkspaceCategoryEnum),
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);



workspaceSchema.pre(["findOneAndDelete" ,"deleteOne" ,"deleteMany"], async function (next) {
  const query = this.getQuery();
  const workspace = await this.model.findOne(query); 
  if (workspace) {
    await DocumentModel.deleteMany({ workspaceId: workspace._id });
    console.log(`Deleted`);
  }
  next(); 
});


export const workspaceModel =
  mongoose.model<IWorkspace>("Workspace", workspaceSchema) ||
  mongoose.models.Workspace;
