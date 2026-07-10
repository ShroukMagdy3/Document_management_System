import z from "zod";
import mongoose from "mongoose";




export const fileSchema = z.array(
  z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    path: z.string(),
    size: z.number(),
  })
);


export const freezeSchema = z.strictObject({
  docId: z.string().refine((value) => {
    return mongoose.Types.ObjectId.isValid(value);
  }, { message: "Invalid document id" }),
})

export const updateDocSchema = z.strictObject({
  name: z.string(),
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

export const uploadSignatureSchema = z.strictObject({
  count: z.number().int().min(1).max(200).optional(),
});

export const confirmUploadSchema = z.strictObject({
  name: z.string().min(1, "file name is required"),
  parentId: objectIdString.nullable().optional(),
  workspaceId: objectIdString.optional(),
  secureUrl: z.string().min(1, "secureUrl is required"),
  publicId: z.string().min(1, "publicId is required"),
  resourceType: z.string().min(1, "resourceType is required"),
  format: z.string().optional(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

export const confirmFolderUploadSchema = z.strictObject({
  parentId: objectIdString.nullable().optional(),
  workspaceId: objectIdString.optional(),
  files: z
    .array(
      z.strictObject({
        path: z.string().min(1),
        secureUrl: z.string().min(1),
        publicId: z.string().min(1),
        resourceType: z.string().min(1),
        format: z.string().optional(),
        size: z.number().optional(),
        mimeType: z.string().optional(),
      })
    )
    .min(1, "at least one file is required"),
});

export type uploadSignatureSchemaType = z.infer<typeof uploadSignatureSchema>
export type confirmUploadSchemaType = z.infer<typeof confirmUploadSchema>
export type confirmFolderUploadSchemaType = z.infer<typeof confirmFolderUploadSchema>

export type freezeSchemaType = z.infer<typeof freezeSchema>
export type updateDocSchemaType = z.infer<typeof updateDocSchema>
export type createFolderSchemaType = z.infer<typeof createFolderSchema>
export type moveSchemaType = z.infer<typeof moveSchema>
