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


export const openPdfSchema = z.strictObject({
 docId:z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid document id" }) ,

})



export type freezeSchemaType = z.infer<typeof freezeSchema >
export type updateDocSchemaType = z.infer<typeof updateDocSchema >
export type openPdfSchemaType = z.infer<typeof openPdfSchema >
