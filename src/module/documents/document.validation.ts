import z from "zod";
import mongoose from "mongoose";
import { AccessControlEnum, typeEnum } from "../../DB/models/document.model";





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


export const freezeSchema =z.strictObject({
  docId:z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid document id" }) ,
})




export const updateDocSchema= z.strictObject({
  name:z.string(),
})


const objectIdString = z.string().refine((value) => {
  return mongoose.Types.ObjectId.isValid(value);
}, { message: "Invalid id" });

export const createFolderSchema = z.strictObject({
  name: z.string().min(1, "folder name is required"),
  parentId: objectIdString.nullable().optional(),
  workspaceId: objectIdString.optional(),
});

export const moveSchema = z.strictObject({
  parentId: objectIdString.nullable(),
});

export type freezeSchemaType = z.infer<typeof freezeSchema >
export type updateDocSchemaType = z.infer<typeof updateDocSchema >
export type createFolderSchemaType = z.infer<typeof createFolderSchema>
export type moveSchemaType = z.infer<typeof moveSchema>
