import { z } from "zod";

import { userBaseSchema } from "./data-base";

export const loginSchema = userBaseSchema
  .pick({
    email: true,
  })
  .and(
    z.object({
      password: z
        .string()
        .min(8, "Password should have be at least 8 characters long."),
    }),
  );
export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password should have be at least 8 characters long."),
  })
  .and(
    userBaseSchema.omit({
      id: true,
      profile: true,
      role: true,
      provider: true,
    }),
  );
export type RegisterSchema = z.infer<typeof registerSchema>;

export const googleProfileSchema = z
  .object({
    email: z.string().email(),
    family_name: z.string(),
    given_name: z.string(),
    granted_scopes: z.string(),
    id: z.string(),
    name: z.string(),
    picture: z.string(),
    verified_email: z.boolean(),
  })
  .transform(
    ({ family_name, given_name, granted_scopes, verified_email, ...rest }) => ({
      ...rest,
      firstName: given_name,
      surname: family_name,
      grantedScopes: granted_scopes,
      verifiedEmail: verified_email,
    }),
  );
export type GoogleProfileSchema = z.infer<typeof googleProfileSchema>;

export const googleAdditionalUserInfoSchema = z.object({
  isNewUser: z.boolean(),
  profile: googleProfileSchema,
  providerId: z.string(),
});
export type GoogleAdditionalUserInfoSchema = z.infer<
  typeof googleAdditionalUserInfoSchema
>;
