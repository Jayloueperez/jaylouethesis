import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import {
  announcementBaseSchema,
  applicationBaseSchema,
  messageBaseSchema,
  messageContainerBaseSchema,
  notificationBaseSchema,
  reportBaseSchema,
  talentBaseSchema,
  talentTeamBaseSchema,
  talentTryoutBaseSchema,
  userBaseSchema,
} from "./data-base";

export const timestampDateSchema = z
  .instanceof(Timestamp)
  .or(z.instanceof(Date))
  .transform((v) => (v instanceof Timestamp ? v.toDate() : v));
export type TimestampDate = z.infer<typeof timestampDateSchema>;

export const dateSchema = z.object({
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type DateSchema = z.infer<typeof dateSchema>;

export const userSchema = userBaseSchema
  .and(dateSchema)
  .superRefine(({ email, role }, ctx) => {
    if (role === "student" && !email.endsWith("@bisu.edu.ph")) {
      ctx.addIssue({
        code: "custom",
        message: "Email is not a valid BISU email.",
        path: ["email"],
      });
    }
  });
export type UserSchema = z.infer<typeof userSchema>;

export const talentSchema = talentBaseSchema.and(dateSchema);
export type TalentSchema = z.infer<typeof talentSchema>;

export const talentTeamSchema = talentTeamBaseSchema.and(dateSchema);
export type TalentTeamSchema = z.infer<typeof talentTeamSchema>;

export const talentTryoutSchema = talentTryoutBaseSchema.and(dateSchema);
export type TalentTryoutSchema = z.infer<typeof talentTryoutSchema>;

export const announcementSchema = announcementBaseSchema.and(dateSchema);
export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const messageContainerSchema =
  messageContainerBaseSchema.and(dateSchema);
export type MessageContainerSchema = z.infer<typeof messageContainerSchema>;

export const messageSchema = messageBaseSchema.and(dateSchema);
export type MessageSchema = z.infer<typeof messageSchema>;

export const applicationSchema = applicationBaseSchema.and(dateSchema);
export type ApplicationSchema = z.infer<typeof applicationSchema>;

export const notificationSchema = notificationBaseSchema.and(dateSchema);
export type NotificationSchema = z.infer<typeof notificationSchema>;

export const reportSchema = reportBaseSchema.and(dateSchema);
export type ReportSchema = z.infer<typeof reportSchema>;
