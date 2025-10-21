import mongoose, { Document, Types } from "mongoose";


export interface IDocument extends Document{
    workspaceId: Types.ObjectId;  
    attachments  :string[],     
  createdAt: Date;
  updatedAt: Date;
}


const DocumentSchema = new mongoose.Schema<IDocument>({
    workspaceId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Workspace"
    },
    attachments:[{
        type:String,
        required:true
    }]
} ,{
    timestamps:true 
})


export const DocumentModel = mongoose.model<IDocument>("Document" , DocumentSchema) || mongoose.models.Document;