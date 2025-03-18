import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export const timestampDateSchema = z
  .instanceof(Timestamp)
  .or(z.instanceof(Date))
  .transform((v) => (v instanceof Timestamp ? v.toDate() : v));
export type TimestampDateSchema = z.infer<typeof timestampDateSchema>;

/**
 * USER
 */

export const userRoleSchema = z.enum(["admin", "student"]);
export type UserRoleSchema = z.infer<typeof userRoleSchema>;

export const userGenderSchema = z.enum(["male", "female", "na"]);
export type UserGenderSchema = z.infer<typeof userGenderSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  middleInitial: z
    .string()
    .max(1, "Middle initial should only have a maximum of 1 letter."),
  surname: z.string(),
  gender: userGenderSchema,
  contact: z.string(),
  address: z.string(),
  age: z.string(),
  course: z.string(),
  year: z.string(),
  section: z.string(),
  profile: z.string(),
  role: userRoleSchema,
  keywords: z.string().array(),
  provider: z.enum(["email-password", "google"]),
  tokens: z.string().array(),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
// .superRefine(({ email, provider }, ctx) => {
//   if (provider === "email-password" && !email.endsWith("@bisu.edu.ph")) {
//     ctx.addIssue({
//       code: "custom",
//       path: ["email"],
//       message: "Email address is not a valid BISU email.",
//     });
//   }
// });
export type UserSchema = z.infer<typeof userSchema>;

/**
 * PLAN TO CHANGE CLUB & SPORT --> TALENT
 */

export const talentTypeSchema = z.enum(["club", "sport"]);
export type TalentTypeSchema = z.infer<typeof talentTypeSchema>;

export const talentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  image: z.string(),
  accepting: z.coerce.number(), // this is for .getTime() date meaning talent will be accepting applications until this date
  members: z.string().array(),
  type: talentTypeSchema,
  keywords: z.string().array(),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type TalentSchema = z.infer<typeof talentSchema>;

/**
 * TALENT_TEAM
 */
export const talentTeamSchema = z.object({
  id: z.string(),
  talentId: z.string(),
  talentType: talentTypeSchema,
  name: z.string(),
  description: z.string(),
  members: z.string().array(),
  keywords: z.string().array(),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type TalentTeamSchema = z.infer<typeof talentTeamSchema>;

/**
 * TALENT TRYOUT
 */
export const talentTryoutSchema = z.object({
  id: z.string(),
  talentId: z.string(),
  talentType: talentTypeSchema,
  title: z.string().min(1, "Title is required."),
  description: z.string(),
  date: z.number().min(0, "Date is required."),
  students: z.string().array(),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type TalentTryoutSchema = z.infer<typeof talentTryoutSchema>;

///////////////////////////////////////////////////////////////////////////////////////////

/**
 * ANNOUNCEMENT
 */
export const announcementTypeSchema = talentTypeSchema.or(
  z.enum(["all", "ids"]),
);
export type AnnouncementTypeSchema = z.infer<typeof announcementTypeSchema>;

export const announcementSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required."),
  subject: z.string().min(1, "Subject is required."),
  description: z.string().min(1, "Description is required."),
  date: z.string().min(1, "Date is required."),
  for: z.string().array(), // ids
  type: announcementTypeSchema,
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type AnnouncementSchema = z.infer<typeof announcementSchema>;

/**
 * MESSAGE_CONTAINER->MESSAGES
 */
export const messageContainerSchema = z.object({
  id: z.string(),
  users: z.string().array(),
  name: z.string(),
  lastRead: z.record(z.string(), z.number()),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type MessageContainerSchema = z.infer<typeof messageContainerSchema>;

export const messageSchema = z.object({
  id: z.string(),
  messageContainerId: z.string(),
  userId: z.string(),
  text: z.string(),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type MessageSchema = z.infer<typeof messageSchema>;

/**
 * APPLICATIONS
 */
export const applicationStatusSchema = z.enum([
  "pending",
  "tryout",
  "accepted",
  "rejected",
  "cancelled",
  "kicked",
  "left",
]);
export type ApplicationStatusSchema = z.infer<typeof applicationStatusSchema>;

export const applicationSchema = z.object({
  id: z.string(),
  talentType: talentTypeSchema,
  talentId: z.string(),
  userId: z.string(),
  message: z.string(),
  status: applicationStatusSchema,
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type ApplicationSchema = z.infer<typeof applicationSchema>;

/**
 * NOTIFICATIONS
 */
export const notificationSchema = z.object({
  id: z.string(),
  sender: z.string(),
  receiver: z.string(),
  title: z.string(),
  body: z.string(),
  isRead: z.string().array(),
  dateCreated: timestampDateSchema,
  dateUpdated: timestampDateSchema,
});
export type NotificationSchema = z.infer<typeof notificationSchema>;
