import { z } from "zod";
import { RoleEnum } from "../../DB/models/users.model";

export const signUpSchema = z.strictObject({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username is too long"),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character"
    ),
  nid: z
    .string()
    .length(14, "National ID must be exactly 14 digits")
    .regex(/^\d+$/, "National ID must contain only numbers"),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Phone number must be between 10 and 15 digits"),
  role: z.enum(RoleEnum).default(RoleEnum.user).optional(),
});
export const confirmEmailSchema = z.strictObject({
  email: z.email("Invalid email format"),
  otp: z.string().length(6),
});
export const signInSchema = z.strictObject({
  email: z.email("Invalid email format"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character"
    ),
});


export type signUpSchemaType = z.infer<typeof signUpSchema>;
export type confirmEmailSchemaType = z.infer<typeof confirmEmailSchema>;
export type signInSchemaType = z.infer<typeof signInSchema>;