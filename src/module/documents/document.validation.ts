import z from "zod";
import { WorkspaceCategoryEnum } from "../../DB/models/workspace.model";
import mongoose from "mongoose";
import { AccessControlEnum } from "../../DB/models/document.model";

export const uploadFileSchema = z.strictObject({
    name: z.string(),
    type: z.enum(WorkspaceCategoryEnum),
    accessControl:z.enum(AccessControlEnum).default(AccessControlEnum.public).optional()

})


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

export const searchSchema = z.strictObject({
  name:z.string().optional(),
  type:z.string().optional(),
  sort:z.string().optional(),
  order:z.string().optional(),
})


export const updateDocSchema= z.strictObject({
  name:z.string().optional(),
  type:z.enum(WorkspaceCategoryEnum).optional(),
  accessControl:z.enum(AccessControlEnum).optional(),
})
export const updateDocSchemaParams= freezeSchema.extend({})

export type downloadSchemaType = z.infer<typeof downloadSchema >
export type freezeSchemaType = z.infer<typeof freezeSchema >
export type searchSchemaType = z.infer<typeof searchSchema >
export type updateDocSchemaType = z.infer<typeof updateDocSchema >
export type updateDocSchemaParamsType = z.infer<typeof updateDocSchemaParams >