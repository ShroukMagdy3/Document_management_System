import z from "zod";

export const updateSchema = z.strictObject({
  name: z.string().optional(),
});

export type updateSchemaType = z.infer<typeof updateSchema>;
