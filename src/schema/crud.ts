import { z } from "zod";

import {
  announcementSchema,
  applicationSchema,
  notificationSchema,
  talentSchema,
  talentTeamSchema,
  talentTryoutSchema,
} from "./data";

/**
 * USER
 */

/**
 * TALENT
 */
export const createTalentInputSchema = talentSchema.omit({
  id: true,
  keywords: true,
  dateCreated: true,
  dateUpdated: true,
});
export type CreateTalentInputSchema = z.infer<typeof createTalentInputSchema>;

export const updateTalentInputSchema = createTalentInputSchema.partial();
export type UpdateTalentInputSchema = z.infer<typeof updateTalentInputSchema>;

/**
 * TALENT TEAM
 */
export const createTalentTeamInputSchema = talentTeamSchema.omit({
  id: true,
  keywords: true,
  dateCreated: true,
  dateUpdated: true,
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
export const createTalentTryoutInputSchema = talentTryoutSchema.omit({
  id: true,
  dateCreated: true,
  dateUpdated: true,
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
export const createAnnouncementInputSchema = announcementSchema.omit({
  id: true,
  dateCreated: true,
  dateUpdated: true,
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
export const createApplicationInputSchema = applicationSchema.omit({
  id: true,
  dateCreated: true,
  dateUpdated: true,
});
export type CreateApplicationInputSchema = z.infer<
  typeof createApplicationInputSchema
>;

/**
 * NOTIFICATION
 */
export const createNotificationInputSchema = notificationSchema.omit({
  id: true,
  isRead: true,
  dateCreated: true,
  dateUpdated: true,
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
