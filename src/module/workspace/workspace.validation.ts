import z from "zod";
import { WorkspaceCategoryEnum } from "../../DB/models/workspace.model";

export const createWorkSpaceSchema = z.strictObject({
  name: z.string(),
  category: z.array(
    z.enum([
      WorkspaceCategoryEnum.school,
      WorkspaceCategoryEnum.internship,
      WorkspaceCategoryEnum.personal,
      WorkspaceCategoryEnum.company,
      WorkspaceCategoryEnum.other,
    ])
  ),
  userNID: z.string().length(14),
  description: z.string().min(5).max(200).optional(),
});
export const updateSchema = z.strictObject({
  name: z.string().optional(),
  category: z.array(
    z.enum([
      WorkspaceCategoryEnum.school,
      WorkspaceCategoryEnum.internship,
      WorkspaceCategoryEnum.personal,
      WorkspaceCategoryEnum.company,
      WorkspaceCategoryEnum.other,
    ])
  ),
  description: z.string().min(5).max(200).optional(),
});

export type createWorkSpaceSchemaType = z.infer<typeof createWorkSpaceSchema>;
export type updateSchemaType = z.infer<typeof updateSchema>;
