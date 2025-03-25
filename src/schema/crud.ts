import { z } from "zod";

import {
  announcementBaseSchema,
  applicationBaseSchema,
  notificationBaseSchema,
  talentBaseSchema,
  talentTeamBaseSchema,
  talentTryoutBaseSchema,
} from "./data-base";

/**
 * USER
 */

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
    data: z.boolean(),
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
