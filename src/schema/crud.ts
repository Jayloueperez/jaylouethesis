import { z } from "zod";

import {
  announcementBaseSchema,
  applicationBaseSchema,
  notificationBaseSchema,
  talentBaseSchema,
  talentTeamBaseSchema,
  talentTryoutBaseSchema,
  userBaseSchema,
} from "./data-base";

/**
 * USER
 */
export const createUserInputSchema = userBaseSchema.omit({
  id: true,
});
export type CreateUserInputSchema = z.infer<typeof createUserInputSchema>;

export const updateUserInfoSchema = userBaseSchema
  .omit({
    id: true,
    email: true,
    keywords: true,
    profile: true,
    provider: true,
    role: true,
    status: true,
    tokens: true,
    talentsAssigned: true,
    attachments: true,
  })
  .and(
    z.object({
      attachments: z.string().array(),
    }),
  )
  .superRefine(
    (
      {
        address,
        age,
        contact,
        course,
        firstName,
        gender,
        middleInitial,
        section,
        surname,
        year,
      },
      ctx,
    ) => {
      if (!address)
        ctx.addIssue({
          code: "custom",
          message: "Address is required.",
          path: ["address"],
        });

      if (!age)
        ctx.addIssue({
          code: "custom",
          message: "Age is required.",
          path: ["age"],
        });

      if (!contact)
        ctx.addIssue({
          code: "custom",
          message: "Contact is required.",
          path: ["contact"],
        });

      if (!course)
        ctx.addIssue({
          code: "custom",
          message: "Course is required.",
          path: ["course"],
        });

      if (!firstName)
        ctx.addIssue({
          code: "custom",
          message: "First name is required.",
          path: ["firstName"],
        });

      if (!gender || gender === "na")
        ctx.addIssue({
          code: "custom",
          message: "Gender is required.",
          path: ["gender"],
        });

      if (middleInitial && middleInitial.length > 1)
        ctx.addIssue({
          code: "custom",
          message: "Middle initial should only be 1 character long.",
          path: ["middleInitial"],
        });

      if (!section)
        ctx.addIssue({
          code: "custom",
          message: "Section is required.",
          path: ["section"],
        });

      if (!surname)
        ctx.addIssue({
          code: "custom",
          message: "Surname is required.",
          path: ["surname"],
        });

      if (!year)
        ctx.addIssue({
          code: "custom",
          message: "Year is required.",
          path: ["year"],
        });
    },
  );
export type UpdateUserInfoSchema = z.infer<typeof updateUserInfoSchema>;

/**
 * TALENT
 */
export const createTalentInputSchema = talentBaseSchema.omit({
  id: true,
  keywords: true,
});
export type CreateTalentInputSchema = z.infer<typeof createTalentInputSchema>;

export const updateTalentInputSchema = createTalentInputSchema.partial();
export type UpdateTalentInputSchema = z.infer<typeof updateTalentInputSchema>;

/**
 * TALENT TEAM
 */
export const createTalentTeamInputSchema = talentTeamBaseSchema.omit({
  id: true,
  keywords: true,
});
export type CreateTalentTeamInputSchema = z.infer<
  typeof createTalentTeamInputSchema
>;

export const updateTalentTeamInputSchema =
  createTalentTeamInputSchema.partial();
export type UpdateTalentTeamInputSchema = z.infer<
  typeof updateTalentTeamInputSchema
>;

/**
 * TALENT TRYOUT
 */
export const createTalentTryoutInputSchema = talentTryoutBaseSchema.omit({
  id: true,
});
export type CreateTalentTryoutInputSchema = z.infer<
  typeof createTalentTryoutInputSchema
>;

export const updateTalentTryoutInputSchema =
  createTalentTryoutInputSchema.partial();
export type UpdateTalentTryoutInputSchema = z.infer<
  typeof updateTalentTryoutInputSchema
>;

/**
 * ANNOUNCEMENT
 */
export const createAnnouncementInputSchema = announcementBaseSchema.omit({
  id: true,
});
export type CreateAnnouncementInputSchema = z.infer<
  typeof createAnnouncementInputSchema
>;

export const updateAnnouncementInputSchema =
  createAnnouncementInputSchema.partial();
export type UpdateAnnouncementInputSchema = z.infer<
  typeof updateAnnouncementInputSchema
>;

/**
 * APPLICATION
 */
export const createApplicationInputSchema = applicationBaseSchema.omit({
  id: true,
});
export type CreateApplicationInputSchema = z.infer<
  typeof createApplicationInputSchema
>;

/**
 * NOTIFICATION
 */
export const createNotificationInputSchema = notificationBaseSchema.omit({
  id: true,
  isRead: true,
});
export type CreateNotificationInputSchema = z.infer<
  typeof createNotificationInputSchema
>;

export const sendNotificationInpuSchema = createNotificationInputSchema.and(
  z.object({
    tokens: z.string().array(),
  }),
);
export type SendNotificationInpuSchema = z.infer<
  typeof sendNotificationInpuSchema
>;

export const sendNotificationResponseSchema = z
  .object({
    type: z.enum(["success"]),
    data: z.string().array(),
  })
  .or(
    z.object({
      type: z.enum(["error"]),
      message: z.string(),
    }),
  );
export type SendNotificationResponseSchema = z.infer<
  typeof sendNotificationResponseSchema
>;
