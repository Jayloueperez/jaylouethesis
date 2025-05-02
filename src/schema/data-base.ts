import { z } from "zod";

// USER
export const userRoleSchema = z.enum(["admin", "student", "coach"]);
export type UserRoleSchema = z.infer<typeof userRoleSchema>;

export const userStatusSchema = z.enum([
  "pending",
  "confirmed",
  "rejected",
  "revoked",
]);
export type UserStatusSchema = z.infer<typeof userStatusSchema>;

export const userBaseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  middleInitial: z
    .string()
    .max(1, "Middle initial should only have a maximum of 1 letter."),
  surname: z.string(),
  gender: z.string(),
  contact: z.string(),
  address: z.string(),
  birthdate: z.string(),
  age: z.string(),
  course: z.string(),
  year: z.string(),
  section: z.string(),
  profile: z.string(),
  role: userRoleSchema,
  keywords: z.string().array(),
  provider: z.enum(["email-password", "google"]),
  tokens: z.string().array(),
  status: userStatusSchema.default("pending"),
  talentsAssigned: z.string().array().default([]),
  attachments: z.string().array().default([]),
});
export type UserBaseSchema = z.infer<typeof userBaseSchema>;

// TALENT
export const talentTypeSchema = z.enum(["culture-and-arts", "sports"]);
export type TalentTypeSchema = z.infer<typeof talentTypeSchema>;

export const talentNodeSchema = z.enum(["parent", "child"]);
export type TalentNodeSchema = z.infer<typeof talentNodeSchema>;

export const talentBaseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  image: z.string(),
  members: z.string().array(),
  type: talentTypeSchema,
  keywords: z.string().array(),
  node: talentNodeSchema,
  parentId: z.string(),
});
export type TalentBaseSchema = z.infer<typeof talentBaseSchema>;

// TALENT_TEAM
export const talentTeamBaseSchema = z.object({
  id: z.string(),
  talentId: z.string(),
  talentType: talentTypeSchema,
  name: z.string(),
  description: z.string(),
  members: z.string().array(),
  keywords: z.string().array(),
});
export type TalentTeamBaseSchema = z.infer<typeof talentTeamBaseSchema>;

// TALENT TRYOUT
export const talentTryoutBaseSchema = z.object({
  id: z.string(),
  talentId: z.string(),
  talentType: talentTypeSchema,
  title: z.string().min(1, "Title is required."),
  description: z.string(),
  date: z.number().min(0, "Date is required."),
  students: z.string().array(),
});
export type TalentTryoutBaseSchema = z.infer<typeof talentTryoutBaseSchema>;

// ANNOUNCEMENT
export const announcementTypeSchema = talentTypeSchema.or(
  z.enum(["all", "ids"]),
);
export type AnnouncementTypeSchema = z.infer<typeof announcementTypeSchema>;

export const announcementBaseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required."),
  subject: z.string().min(1, "Subject is required."),
  description: z.string().min(1, "Description is required."),
  date: z.string().min(1, "Date is required."),
  for: z.string().array(), // ids
  type: announcementTypeSchema,
});
export type AnnouncementBaseSchema = z.infer<typeof announcementBaseSchema>;

// MESSAGES
export const messageContainerBaseSchema = z.object({
  id: z.string(),
  users: z.string().array(),
  name: z.string(),
  lastRead: z.record(z.string(), z.number()),
});
export type MessageContainerBaseSchema = z.infer<
  typeof messageContainerBaseSchema
>;

export const messageBaseSchema = z.object({
  id: z.string(),
  messageContainerId: z.string(),
  userId: z.string(),
  text: z.string(),
});
export type MessageBaseSchema = z.infer<typeof messageBaseSchema>;

// APPLICATIONS
export const applicationStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
]);
export type ApplicationStatusSchema = z.infer<typeof applicationStatusSchema>;

export const applicationBaseSchema = z.object({
  id: z.string(),
  talentType: talentTypeSchema,
  talentId: z.string(),
  userId: z.string(),
  message: z.string(),
  status: applicationStatusSchema,
});
export type ApplicationBaseSchema = z.infer<typeof applicationBaseSchema>;

// NOTIFICATIONS
export const notificationBaseSchema = z.object({
  id: z.string(),
  sender: z.string(),
  receiver: z.string(),
  title: z.string(),
  body: z.string(),
  isRead: z.boolean(),
});
export type NotificationBaseSchema = z.infer<typeof notificationBaseSchema>;

// REPORTS
export const reportBaseSchema = z.object({
  id: z.string(),
  talentId: z.string(),
  title: z.string(),
  members: z.string().array(),
});
export type ReportBaseSchema = z.infer<typeof reportBaseSchema>;
