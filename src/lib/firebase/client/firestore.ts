import {
  and,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  or,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import _ from "lodash";

import {
  CreateAnnouncementInputSchema,
  CreateNotificationInputSchema,
  CreateTalentInputSchema,
  CreateTalentTryoutInputSchema,
  UpdateAnnouncementInputSchema,
  UpdateTalentInputSchema,
  UpdateTalentTryoutInputSchema,
} from "~/schema/crud";
import {
  AnnouncementTypeSchema,
  ApplicationBaseSchema,
  ApplicationStatusSchema,
  TalentNodeSchema,
  TalentTypeSchema,
  UserRoleSchema,
} from "~/schema/data-base";
import {
  announcementSchema,
  AnnouncementSchema,
  applicationSchema,
  ApplicationSchema,
  MessageContainerSchema,
  MessageSchema,
  notificationSchema,
  NotificationSchema,
  reportSchema,
  ReportSchema,
  talentSchema,
  TalentSchema,
  talentTryoutSchema,
  TalentTryoutSchema,
  userSchema,
  UserSchema,
} from "~/schema/data-client";
import { getError } from "~/utils/error";
import { generateKeywords } from "~/utils/string";
import { firestore } from ".";
import { sendNotification } from "./messaging";

export const createCollection = <T extends DocumentData>(
  path: string,
  ...pathSegments: string[]
) => collection(firestore, path, ...pathSegments) as CollectionReference<T, T>;

export const USERS_COLLECTION = createCollection<UserSchema>("users");
export const TALENTS_COLLECTION = createCollection<TalentSchema>("talents");
export const ANNOUNCEMENTS_COLLECTION =
  createCollection<AnnouncementSchema>("announcements");
export const MESSAGE_CONTAINERS_COLLECTION =
  createCollection<MessageContainerSchema>("message-containers");
export const MESSAGES_COLLECTION = createCollection<MessageSchema>("messages");
export const APPLICATION_COLLECTION =
  createCollection<ApplicationSchema>("applications");
export const NOTIFICATION_COLLECTION =
  createCollection<NotificationSchema>("notifications");
export const TALENT_TRYOUT_COLLECTION =
  createCollection<TalentTryoutSchema>("talent-tryout");
export const REPORTS_COLLECTION = createCollection<ReportSchema>("reports");

export async function checkUser(email: string, role: UserRoleSchema) {
  try {
    const result = await getDocs(
      query(USERS_COLLECTION, where("email", "==", email), limit(1)),
    );

    if (result.docs.length === 0) throw new Error("User not found.");

    const { data, error } = userSchema.safeParse(result.docs[0].data());

    if (error) {
      console.log("getUserBy error:", error);
      throw new Error("Invalid user data.");
    }

    if (data.role !== role) throw new Error(`User is not ${role}.`);

    return data;
  } catch (error) {
    console.log("getUserBy error:", error);
    const err = getError(error, "Failed getting user.");

    throw err;
  }
}

export async function checkUserExist(id: string) {
  try {
    const result = await getDoc(doc(USERS_COLLECTION, id));

    return result.exists();
  } catch (error) {
    console.log("checkUserExist error:", error);
    const err = getError(error, "Failed checking if user exist.");

    throw err;
  }
}

export async function createUser(
  id: string,
  data: Omit<UserSchema, "id" | "dateCreated" | "dateUpdated">,
) {
  try {
    const ref = doc(USERS_COLLECTION, id);

    await setDoc(ref, {
      id,
      ...data,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    return id;
  } catch (error) {
    console.log("createUser error:", error);
    const err = getError(error, "Failed creating new user.");

    throw err;
  }
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserSchema, "id" | "dateCreated" | "dateUpdated">>,
) {
  try {
    const ref = doc(USERS_COLLECTION, id);

    await updateDoc(ref, {
      ...data,
      dateUpdated: new Date(),
    });

    return true;
  } catch (error) {
    console.log("updateUser error:", error);
    const err = getError(error, "Failed updating user data.");

    throw err;
  }
}

export async function deleteUser(id: string) {
  try {
    const ref = doc(USERS_COLLECTION, id);

    return deleteDoc(ref);
  } catch (error) {
    console.log("deleteUser error:", error);
    const err = getError(error, "Failed deleting user.");

    throw err;
  }
}

export async function getUser(id: string) {
  try {
    const snapshot = await getDoc(doc(USERS_COLLECTION, id));

    if (!snapshot.exists) throw new Error("User does not exist.");

    const { data, error } = userSchema.safeParse(snapshot.data());

    if (error) {
      console.log("getUser error:", error);
      throw new Error("Invalid user data.");
    }

    return data;
  } catch (error) {
    console.log("getUser error:", error);
    const err = getError(error, "Failed getting user.");

    throw err;
  }
}

export function getUserRealtime(id: string) {
  return function (callback: (user: UserSchema | null) => void) {
    return onSnapshot(doc(USERS_COLLECTION, id), (snapshot) => {
      if (!snapshot.exists()) return callback(null);

      const { data, error } = userSchema.safeParse(snapshot.data());

      if (error) console.log("getUserRealtime error:", error);

      callback(data ?? null);
    });
  };
}

export async function getUsers(params?: {
  ids?: string[];
  role?: UserRoleSchema | UserRoleSchema[];
}) {
  try {
    const { ids, role } = params ?? {};

    let q = query(USERS_COLLECTION);

    if (ids && ids.length > 0) q = query(q, where("id", "in", ids));
    if (typeof role === "string" && role)
      q = query(q, where("role", "==", role));
    if (typeof role === "object" && role.length > 0)
      q = query(q, where("role", "in", role));

    const snapshot = await getDocs(q);
    if (snapshot.docs.length === 0) return [];

    const { data, error } = userSchema
      .array()
      .safeParse(snapshot.docs.map((d) => d.data()));

    if (error) console.log("getUsers error:", error);

    return data ?? [];
  } catch (error) {
    console.log("getUsers error:", error);
    const err = getError(error, "Failed getting users.");

    throw err;
  }
}

export function getUsersRealtime(params?: {
  ids?: string[];
  role?: UserRoleSchema;
  roles?: UserRoleSchema[];
  talentId?: string;
}) {
  return function (callback: (users: UserSchema[]) => void) {
    const { ids, role, roles, talentId } = params ?? {};

    let q = query(USERS_COLLECTION);

    if (ids && ids.length > 0) q = query(q, where("id", "in", ids));
    if (role) q = query(q, where("role", "==", role));
    if (roles && roles.length > 0) q = query(q, where("role", "in", roles));
    if (talentId)
      q = query(q, where("talentsAssigned", "array-contains", talentId));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { data, error } = userSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (error) console.log("getUsersRealtime error:", error);

      callback(data ?? []);
    });
  };
}

/**
 * TALENT
 */
export async function createTalent(data: CreateTalentInputSchema) {
  try {
    const ref = doc(TALENTS_COLLECTION);

    await setDoc(ref, {
      ...data,
      keywords: generateKeywords(data.name),
      id: ref.id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    return ref.id;
  } catch (error) {
    console.log("createTalent error:", error);
    const err = getError(error, "Failed creating talent.");

    throw err;
  }
}

export async function updateTalent(id: string, data: UpdateTalentInputSchema) {
  try {
    const ref = doc(TALENTS_COLLECTION, id);

    return updateDoc(ref, {
      ...data,
      ...(data.name ? { keywords: generateKeywords(data.name) } : {}),
      dateUpdated: new Date(),
    });
  } catch (error) {
    console.log("updateTalent error:", error);
    const err = getError(error, "Failed updating talent.");

    throw err;
  }
}

export async function updateTalentAddMembers(id: string, memberIds: string[]) {
  try {
    const ref = doc(TALENTS_COLLECTION, id);

    const currentData = await getTalent(id);

    return updateDoc(ref, {
      members: _.uniq([...currentData.members, ...memberIds]),
      dateUpdated: new Date(),
    });
  } catch (error) {
    console.log("updateTalentAddMembers error:", error);
    const err = getError(error, "Failed updating talent.");

    throw err;
  }
}

export async function deleteTalent(id: string) {
  try {
    const ref = doc(TALENTS_COLLECTION, id);

    const applications = await getDocs(
      query(APPLICATION_COLLECTION, where("talentId", "==", id)),
    );
    const reports = await getDocs(
      query(REPORTS_COLLECTION, where("talentId", "==", id)),
    );

    if (applications.size > 0 || reports.size > 0) {
      const batch = writeBatch(firestore);

      applications.forEach((a) => {
        batch.delete(a.ref);
      });

      reports.forEach((r) => {
        batch.delete(r.ref);
      });

      await batch.commit();
    }

    return deleteDoc(ref);
  } catch (error) {
    console.log("deleteTalent error:", error);
    const err = getError(error, "Failed deleting talent.");

    throw err;
  }
}

export async function getTalent(id: string) {
  try {
    const ref = doc(TALENTS_COLLECTION, id);
    const snapshot = await getDoc(ref);

    const { data, error } = talentSchema.safeParse(snapshot.data());

    if (error) {
      console.log("getTalent error:", error);
      throw new Error(error.issues[0].message);
    }

    return data;
  } catch (error) {
    console.log("getTalent error:", error);
    const err = getError(error, "Failed getting talent.");

    throw err;
  }
}

export function getTalentRealtime(id: string) {
  return function (callback: (talent: TalentSchema | null) => void) {
    const ref = doc(TALENTS_COLLECTION, id);

    return onSnapshot(ref, (snapshot) => {
      const { data, error } = talentSchema.safeParse(snapshot.data());

      if (error) console.log("getTalentRealtime error:", error);

      callback(data ?? null);
    });
  };
}

export async function getTalents(params?: {
  ids?: string[];
  type?: TalentTypeSchema;
}) {
  try {
    const { ids, type } = params ?? {};

    let q = query(TALENTS_COLLECTION);

    if (ids) q = query(q, where("id", "in", ids));
    if (type) q = query(q, where("type", "==", type));

    const snapshot = await getDocs(q);

    const { data, error } = talentSchema
      .array()
      .safeParse(snapshot.docs.map((d) => d.data()));

    if (error) {
      console.log("getTalents error:", error);
      throw new Error(error.issues[0].message);
    }

    return data;
  } catch (error) {
    console.log("getTalents error:", error);
    const err = getError(error, "Failed getting talents.");

    throw err;
  }
}

export function getTalentsRealtime(params?: {
  ids?: string[];
  type?: TalentTypeSchema;
  node?: TalentNodeSchema;
  orderBy?: "asc" | "desc";
  parentId?: string;
}) {
  return function (callback: (talents: TalentSchema[]) => void) {
    const { ids, type, node, orderBy: orderTalentsBy, parentId } = params ?? {};

    let q = query(TALENTS_COLLECTION);

    if (ids) q = query(q, where("id", "in", ids));
    if (type) q = query(q, where("type", "==", type));
    if (node) q = query(q, where("node", "==", node));
    if (parentId) q = query(q, where("parentId", "==", parentId));
    if (orderTalentsBy) q = query(q, orderBy("dateCreated", orderTalentsBy));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { data, error } = talentSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (error) console.log("getTalentsRealtime error:", error);

      callback(data ?? []);
    });
  };
}

/**
 * TALENT_TRYOUT
 */
export async function createTalentTryout(data: CreateTalentTryoutInputSchema) {
  try {
    const ref = doc(TALENT_TRYOUT_COLLECTION);

    await setDoc(ref, {
      ...data,
      id: ref.id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    return ref.id;
  } catch (error) {
    console.log("createTalentTryout error:", error);
    const err = getError(error, "Failed creating talent tryout.");

    throw err;
  }
}

export async function updateTalentTryout(
  id: string,
  data: UpdateTalentTryoutInputSchema,
) {
  try {
    const ref = doc(TALENT_TRYOUT_COLLECTION, id);

    return updateDoc(ref, {
      ...data,
      dateUpdated: new Date(),
    });
  } catch (error) {
    console.log("updateTalentTryout error:", error);
    const err = getError(error, "Failed updating talent tryout.");

    throw err;
  }
}

export async function deleteTalentTryout(id: string) {
  try {
    const ref = doc(TALENT_TRYOUT_COLLECTION, id);

    return deleteDoc(ref);
  } catch (error) {
    console.log("deleteTalentTryout error:", error);
    const err = getError(error, "Failed deleting talent tryout.");

    throw err;
  }
}

export async function getTalentTryouts(params?: {
  talentId?: string;
  talentType?: TalentTypeSchema;
  dateAfter?: number;
  dateBefore?: number;
}) {
  try {
    const { dateAfter, dateBefore, talentId, talentType } = params ?? {};

    let q = query(TALENT_TRYOUT_COLLECTION);

    if (talentId) q = query(q, where("talentId", "==", talentId));
    if (talentType) q = query(q, where("talentType", "==", talentType));
    if (dateAfter) q = query(q, where("date", ">=", dateAfter));
    if (dateBefore) q = query(q, where("date", "<=", dateBefore));

    q = query(q, orderBy("date", "asc"));

    const result = await getDocs(q);

    if (result.size === 0) return [];

    const { data, error } = talentTryoutSchema
      .array()
      .safeParse(result.docs.map((d) => d.data()));

    if (error) console.log("getTalentTryouts error:", error);

    return data ?? [];
  } catch (error) {
    console.log("getTalentTryouts error:", error);
    const err = getError(error, "Failed getting talent tryouts.");

    throw err;
  }
}

export function getTalentTryoutsRealtime(params?: {
  talentId?: string;
  talentType?: TalentTypeSchema;
  dateAfter?: number;
  dateBefore?: number;
}) {
  return function (callback: (talentTryouts: TalentTryoutSchema[]) => void) {
    const { dateAfter, dateBefore, talentId, talentType } = params ?? {};

    let q = query(TALENT_TRYOUT_COLLECTION);

    if (talentId) q = query(q, where("talentId", "==", talentId));
    if (talentType) q = query(q, where("talentType", "==", talentType));
    if (dateAfter) q = query(q, where("date", ">=", dateAfter));
    if (dateBefore) q = query(q, where("date", "<=", dateBefore));

    q = query(q, orderBy("date", "asc"));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { data, error } = talentTryoutSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (error) console.log("getTalentTryoutsRealtime error:", error);

      callback(data ?? []);
    });
  };
}

export function getTalentTryoutByRealtime(params?: {
  talentId: string;
  applicationId: string;
}) {
  return function (
    callback: (talentTryouts: TalentTryoutSchema | null) => void,
  ) {
    const { talentId, applicationId } = params ?? {};
    console.log(talentId, applicationId);

    let q = query(TALENT_TRYOUT_COLLECTION);

    if (talentId) q = query(q, where("talentId", "==", talentId));
    if (applicationId)
      q = query(q, where("students", "array-contains", applicationId));

    q = query(q, limit(1));

    return onSnapshot(q, (snapshot) => {
      const snapshotDoc = snapshot.docs[0];

      if (!snapshotDoc || !snapshotDoc.exists) return callback(null);

      const { data, error } = talentTryoutSchema.safeParse(snapshotDoc.data());

      if (error) console.log("getTalentTryoutsRealtime error:", error);

      callback(data ?? null);
    });
  };
}

/**
 * ANNOUNCEMENT
 */
export async function createAnnouncement(data: CreateAnnouncementInputSchema) {
  try {
    const ref = doc(ANNOUNCEMENTS_COLLECTION);

    await setDoc(ref, {
      ...data,
      id: ref.id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    return ref.id;
  } catch (error) {
    console.log("createAnnouncement error:", error);
    const err = getError(error, "Failed creating announcement.");

    throw err;
  }
}

export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementInputSchema,
) {
  try {
    const ref = doc(ANNOUNCEMENTS_COLLECTION, id);

    return updateDoc(ref, {
      ...data,
      dateUpdated: new Date(),
    });
  } catch (error) {
    console.log("updateAnnouncement error:", error);
    const err = getError(error, "Failed updating announcement.");

    throw err;
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const ref = doc(ANNOUNCEMENTS_COLLECTION, id);

    return deleteDoc(ref);
  } catch (error) {
    console.log("deleteAnnouncement error:", error);
    const err = getError(error, "Failed deleting announcement.");

    throw err;
  }
}

export async function getAnnouncement(id: string) {
  try {
    const snapshot = await getDoc(doc(ANNOUNCEMENTS_COLLECTION, id));
    const { data, error } = announcementSchema.safeParse(snapshot.data());

    if (error) console.log("getAnnouncement error:", error);

    return data ?? null;
  } catch (error) {
    console.log("getAnnouncement error:", error);
    const err = getError(error, "Failed getting announcement.");

    throw err;
  }
}

export function getAnnouncementRealtime(id: string) {
  return function (
    callback: (announcement: AnnouncementSchema | null) => void,
  ) {
    return onSnapshot(doc(ANNOUNCEMENTS_COLLECTION, id), (snapshot) => {
      const { data, error } = announcementSchema.safeParse(snapshot.data());

      if (error) console.log("getAnnouncementRealtime error:", error);

      callback(data ?? null);
    });
  };
}

export function getAnnouncementsRealtime(params?: {
  ids?: string[];
  type?:
    | Exclude<AnnouncementTypeSchema, "ids">
    | Exclude<AnnouncementTypeSchema, "ids">[];
  forIds?: string[];
  sort?: "latest" | "oldest" | "latest-by-date" | "oldest-by-date";
}) {
  return function (callback: (announcements: AnnouncementSchema[]) => void) {
    const { ids, type, forIds, sort = "latest" } = params ?? {};

    let q = query(ANNOUNCEMENTS_COLLECTION);

    if (ids) q = query(q, where("id", "in", ids));
    if (type && forIds && forIds.length > 0) {
      if (typeof type === "string") {
        q = query(
          q,
          or(
            where("type", "==", type),
            and(
              where("type", "==", "ids"),
              where("for", "array-contains-any", forIds),
            ),
          ),
        );
      }

      if (typeof type === "object" && type.length > 0) {
        q = query(
          q,
          or(
            where("type", "in", type),
            and(
              where("type", "==", "ids"),
              where("for", "array-contains-any", forIds),
            ),
          ),
        );
      }
    } else {
      if (typeof type === "string") q = query(q, where("type", "==", type));
      if (typeof type === "object" && type.length > 0)
        q = query(q, where("type", "in", type));
      if (forIds && forIds.length > 0)
        q = query(
          q,
          where("type", "==", "ids"),
          where("for", "array-contains-any", forIds),
        );
    }

    if (sort === "latest") q = query(q, orderBy("dateCreated", "desc"));
    else if (sort === "oldest") q = query(q, orderBy("dateCreated", "asc"));
    else if (sort === "latest-by-date") q = query(q, orderBy("date", "desc"));
    else q = query(q, orderBy("date", "asc"));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { data, error } = announcementSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (error) console.log("getAnnouncementsRealtime error:", error);

      callback(data ?? []);
    });
  };
}

/**
 * NOTIFICATIONS
 */
export async function createNotification(data: CreateNotificationInputSchema) {
  try {
    const ref = doc(NOTIFICATION_COLLECTION);

    await setDoc(ref, {
      ...data,
      id: ref.id,
      isRead: false,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    return ref.id;
  } catch (error) {
    console.log("createNotification error:", error);
    const err = getError(error, "Failed creating new notification.");

    throw err;
  }
}

export function getNotificationsRealtime(params?: {
  sender?: string;
  receiver?: string;
}) {
  return function (callback: (notifications: NotificationSchema[]) => void) {
    const { receiver, sender } = params ?? {};

    let q = query(NOTIFICATION_COLLECTION);

    if (receiver) q = query(q, where("receiver", "==", receiver));
    if (sender) q = query(q, where("sender", "==", sender));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { data, error } = notificationSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (error) console.log("getNotificationsRealtime error", error);

      callback(data ?? []);
    });
  };
}

/**
 * APPLICATIONS
 */
export async function createApplication(
  data: Omit<ApplicationSchema, "id" | "dateCreated" | "dateUpdated">,
) {
  try {
    const studentData = await getUser(data.userId);
    const talentData = await getTalent(data.talentId);

    if (!talentData) throw new Error(`Cannot find ${data.talentType} data.`);

    const exists = await getDocs(
      query(
        APPLICATION_COLLECTION,
        and(
          where("talentType", "==", data.talentType),
          where("talentId", "==", data.talentId),
          where("userId", "==", data.userId),
          where("status", "in", ["pending", "tryout", "accepted"]),
        ),
        limit(1),
      ),
    );

    if (exists.size > 0)
      throw new Error(
        `You currently have an ongoing application of this ${data.talentType}.`,
      );

    const ref = doc(APPLICATION_COLLECTION);

    await setDoc(ref, {
      ...data,
      id: ref.id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    await sendNotification({
      title: `New ${_.upperFirst(data.talentType)} Application`,
      body: `${studentData.firstName} sent an application for ${talentData.name}.`,
      // isRead: false,
      receiver: "all",
      sender: data.userId,
    });

    await createNotification({
      title: `New ${_.upperFirst(data.talentType)} Application`,
      body: `${studentData.firstName} sent an application for ${talentData.name}.`,
      // isRead: false,
      receiver: "all",
      sender: data.userId,
    });

    return ref.id;
  } catch (error) {
    console.log("createApplication error:", error);
    const err = getError(error, "Failed creating new application.");

    throw err;
  }
}

export async function updateApplication(
  id: string,
  data: Partial<Omit<ApplicationSchema, "id" | "dateCreated" | "dateUpdated">>,
) {
  try {
    const ref = doc(APPLICATION_COLLECTION, id);

    return updateDoc(ref, { ...data, dateUpdated: new Date() });
  } catch (error) {
    console.log("updateApplication error:", error);
    const err = getError(error, "Failed updating application.");

    throw err;
  }
}

export async function updateApplications(
  ids: string[],
  data: Partial<ApplicationBaseSchema>,
) {
  try {
    const batch = writeBatch(firestore);

    ids.forEach((id) => {
      batch.update(doc(APPLICATION_COLLECTION, id), {
        ...data,
        dateUpdated: new Date(),
      });
    });

    await batch.commit();

    return true;
  } catch (error) {
    console.log("updateApplications error:", error);
    const err = getError(error, "Failed updating applications.");

    throw err;
  }
}

export async function deleteApplication(id: string) {
  try {
    const ref = doc(APPLICATION_COLLECTION, id);

    return deleteDoc(ref);
  } catch (error) {
    console.log("deleteApplication error:", error);
    const err = getError(error, "Failed deleting application.");

    throw err;
  }
}

export async function getApplicationBy(
  params: Pick<ApplicationSchema, "talentType" | "talentId" | "userId">,
) {
  try {
    const { talentType, talentId, userId } = params;

    const snapshot = await getDocs(
      query(
        APPLICATION_COLLECTION,
        where("talentType", "==", talentType),
        where("talentId", "==", talentId),
        where("userId", "==", userId),
      ),
    );

    if (snapshot.docs.length === 0) return null;

    const { data, error } = applicationSchema.safeParse(
      snapshot.docs[0].data(),
    );

    if (error) console.log("getApplicationBy error:", error);

    return data ?? null;
  } catch (error) {
    console.log("checkApplication error:", error);
    const err = getError(error, "Failed checking application.");

    throw err;
  }
}

export function getApplicationByRealtime(
  params: Pick<ApplicationSchema, "talentType" | "talentId" | "userId"> & {
    status?: ApplicationStatusSchema | ApplicationStatusSchema[];
  },
) {
  return function (callback: (application: ApplicationSchema | null) => void) {
    const { status, talentType, talentId, userId } = params;

    let q = query(
      APPLICATION_COLLECTION,
      where("talentType", "==", talentType),
      where("talentId", "==", talentId),
      where("userId", "==", userId),
    );

    if (_.isString(status) && status)
      q = query(q, where("status", "==", status));
    if (_.isArray(status) && status.length > 0)
      q = query(q, where("status", "in", status));

    q = query(q, orderBy("dateCreated", "desc"));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length === 0) return callback(null);

      const { data, error } = applicationSchema.safeParse(
        snapshot.docs[0].data(),
      );

      if (error) console.log("getApplicationBy error:", error);

      callback(data ?? null);
    });
  };
}

export async function getApplication(id: string) {
  try {
    const snapshot = await getDoc(doc(APPLICATION_COLLECTION, id));

    const { data, error } = applicationSchema.safeParse(snapshot.data());

    if (error) console.log("getApplication error:", error);

    return data ?? null;
  } catch (error) {
    console.log("getApplication error:", error);
    const err = getError(error, "Failed getting application.");

    throw err;
  }
}

export function getApplicationRealtime(id: string) {
  return function (callback: (application: ApplicationSchema | null) => void) {
    return onSnapshot(doc(APPLICATION_COLLECTION, id), (snapshot) => {
      if (!snapshot.exists()) return callback(null);

      const { data, error } = applicationSchema.safeParse(snapshot.data());

      if (error) console.log("getApplicationRealtime error", error);

      callback(data ?? null);
    });
  };
}

export async function getApplications(params?: {
  status?: ApplicationStatusSchema | ApplicationStatusSchema[];
  talentType?: TalentTypeSchema;
  talentId?: string;
}) {
  try {
    const { status, talentType, talentId } = params ?? {};

    let q = query(APPLICATION_COLLECTION);

    if (_.isString(status) && status)
      q = query(q, where("status", "==", status));
    if (_.isArray(status) && status.length > 0)
      q = query(q, where("status", "in", status));
    if (talentType) q = query(q, where("talentType", "==", talentType));
    if (talentId) q = query(q, where("talentId", "==", talentId));

    const snapshot = await getDocs(q);
    if (snapshot.docs.length === 0) return [];

    const { data, error } = applicationSchema
      .array()
      .safeParse(snapshot.docs.map((d) => d.data()));

    if (error) console.log("getApplications error", error);

    return data ?? [];
  } catch (error) {
    console.log("getApplications error:", error);
    const err = getError(error, "Failed getting applications.");

    throw err;
  }
}

export function getApplicationsRealtime(params?: {
  status?: ApplicationStatusSchema | ApplicationStatusSchema[];
  talentType?: TalentTypeSchema;
  talentId?: string;
  ids?: string[];
}) {
  return function (callback: (applications: ApplicationSchema[]) => void) {
    const { status, talentType, talentId, ids } = params ?? {};

    let q = query(APPLICATION_COLLECTION);

    if (_.isString(status) && status)
      q = query(q, where("status", "==", status));
    if (_.isArray(status) && status.length > 0)
      q = query(q, where("status", "in", status));
    if (talentType) q = query(q, where("talentType", "==", talentType));
    if (talentId) q = query(q, where("talentId", "==", talentId));
    if (ids && ids.length > 0) q = query(q, where("id", "in", ids));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { data, error } = applicationSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (error) console.log("getApplications error", error);

      callback(data ?? []);
    });
  };
}

export async function createReport(
  data?: Omit<ReportSchema, "id" | "dateCreated" | "dateUpdated">,
) {
  try {
    const ref = doc(REPORTS_COLLECTION);

    await setDoc(ref, {
      ...data,
      id: ref.id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });

    return ref.id;
  } catch (error) {
    console.log("createReport error:", error);
    const err = getError(error, "Failed creating report.");

    throw err;
  }
}

export function getReportsRealtime(params?: { talentId?: string }) {
  return function (callback: (reports: ReportSchema[]) => void) {
    const { talentId } = params ?? {};

    let q = query(REPORTS_COLLECTION);

    if (talentId) q = query(q, where("talentId", "==", talentId));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.size === 0) return callback([]);

      const { success, data, error } = reportSchema
        .array()
        .safeParse(snapshot.docs.map((d) => d.data()));

      if (!success) console.log("getReportsRealtime error:", error);

      callback(data ?? []);
    });
  };
}
