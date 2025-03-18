import {
  getMessaging,
  getToken,
  MessagePayload,
  Messaging,
  NextFn,
  Observer,
  onMessage,
} from "firebase/messaging";

import { env } from "~/env";
import {
  CreateNotificationInputSchema,
  sendNotificationResponseSchema,
} from "~/schema/crud";
import { getError } from "~/utils/error";
import { app } from ".";
import { getUser } from "./firestore";

let messaging: Messaging | undefined;

if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") return true;

    return false;
  } catch (error) {
    const err = getError(error, "Failed requesting notification permission.");

    throw err.message;
  }
};

export const getFCMToken = async () => {
  try {
    if (!messaging) throw new Error("FCM not initialized.");

    const token = await getToken(messaging, {
      vapidKey: env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    const err = getError(error, "Failed getting fcm token.");

    throw err.message;
  }
};

export const onFCMMessage = (
  callback: NextFn<MessagePayload> | Observer<MessagePayload>,
) => {
  if (!messaging) throw new Error("FCM not initialized.");

  return onMessage(messaging, callback);
};

export const sendNotification = async (data: CreateNotificationInputSchema) => {
  try {
    const user = await getUser(data.receiver);

    if (!user) throw new Error("Unable to get fcm token.");
    if (user.tokens.length === 0) {
      return false;
    }

    const result = await fetch("/api/send-notification", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        tokens: user.tokens,
      }),
    }).then((r) => r.json());

    const {
      success,
      data: responseData,
      error,
    } = sendNotificationResponseSchema.safeParse(result);

    if (!success) {
      console.log("sendNotification error:", error);
      throw new Error("Invalid response data.");
    }

    if (responseData.type === "error") {
      throw new Error(responseData.message);
    }

    return responseData.data;
  } catch (error) {
    console.log("sendNotification error:", error);
    const err = getError(error, "Failed sending notification.");

    throw err;
  }
};
