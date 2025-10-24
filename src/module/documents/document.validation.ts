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
  }, { message: "Invalid user id" }) ,
  fileId: z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid user id" }) ,
  workspaceId:z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid user id" }) ,

})


export type downloadSchemaType = z.infer<typeof downloadSchema >