import { z } from "zod";

import { userBaseSchema } from "./data-base";

export const newUserFormSchema = userBaseSchema
  .pick({
    email: true,
    firstName: true,
    middleInitial: true,
    surname: true,
  })
  .and(
    z.object({
      talentsAssigned: z.string().array(),
      password: z
        .string({ message: "Password is required." })
        .min(8, "Password must be at least 8 characters long."),
      confirmPassword: z.string(),
    }),
  )
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });
export type NewUserFormSchema = z.infer<typeof newUserFormSchema>;

export const assignCoachFormSchema = z.object({
  talentsAssigned: z.string().array(),
});
export type AssignCoachFormSchema = z.infer<typeof assignCoachFormSchema>;
