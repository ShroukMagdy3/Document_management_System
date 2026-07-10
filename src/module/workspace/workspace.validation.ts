import z from "zod";
import mongoose from "mongoose";

export const updateSchema = z.strictObject({
  name: z.string().optional(),
});

export const createWorkspaceSchema = z.strictObject({
  name: z.string().min(1, "workspace name is required"),
});

export const workspaceIdParamSchema = z.strictObject({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid workspace id",
  }),
});

export type updateSchemaType = z.infer<typeof updateSchema>;
export type createWorkspaceSchemaType = z.infer<typeof createWorkspaceSchema>;
