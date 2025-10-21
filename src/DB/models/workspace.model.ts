import mongoose, { Document } from "mongoose";


export enum WorkspaceCategoryEnum {
  school = "school",
  internship = "internship",
  company = "company",
  personal = "personal",
}

export interface IWorkspace extends Document{
    userNID: string;         
  name: string;             
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}


const workspaceSchema = new mongoose.Schema<IWorkspace>({
    userNID:{
        type:String,
        required:true,
        length:14
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String ,
        minlength:3 ,
        maxlength:200
    },
    category:{
        type:String,
        enum:WorkspaceCategoryEnum,
        required:true
    }


} ,{
    timestamps:true 
})


export const workspaceModel = mongoose.model<IWorkspace>("Workspace" , workspaceSchema) || mongoose.models.Workspace;