import mongoose, { Document } from "mongoose";
import { DocumentModel } from "./document.model";
import { Types } from "mongoose";


export interface IWorkspace extends Document {
  userNID: string;
  name: string;
  documents:Types.ObjectId[]
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
    documents:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Document"
    }]
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
