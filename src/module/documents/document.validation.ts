import z from "zod";
import { WorkspaceCategoryEnum } from "../../DB/models/workspace.model";
import mongoose from "mongoose";

export const uploadFileSchema = z.strictObject({
    name: z.string(),
    type: z.enum(WorkspaceCategoryEnum),

}).required()


  export const fileSchema =z.array(
  z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    path: z.string(),
    size: z.number(),
  })
);

export const downloadSchema = z.strictObject({
  DocumentId: z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid document id" }) ,
  fileId: z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid file id" }) ,
  workspaceId:z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid workspace id" }) ,

})

export const freezeSchema =z.strictObject({
  docId:z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid document id" }) ,
  workspaceId:z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid workspace id" }) ,
})


export type downloadSchemaType = z.infer<typeof downloadSchema >
export type freezeSchemaType = z.infer<typeof freezeSchema >