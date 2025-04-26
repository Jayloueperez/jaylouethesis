import { NextRequest, NextResponse } from "next/server";
import { Message } from "firebase-admin/messaging";

import { getUsers } from "~/lib/firebase/client/firestore";
import { messaging } from "~/lib/firebase/server";
import { createNotificationInputSchema } from "~/schema/crud";
import { getError } from "~/utils/error";

function getSuccessResponse<T>(data: T) {
  return NextResponse.json({
    type: "success",
    data,
  });
}

function getErrorResponse(message: string) {
  return NextResponse.json({
    type: "error",
    message,
  });
}

async function HANDLER(request: NextRequest) {
  try {
    const dataRaw = await request.json();

    const { success, data, error } =
      createNotificationInputSchema.safeParse(dataRaw);

    if (!success) {
      console.log("/api/send-notifcation error:", error);

      return NextResponse.json({
        type: "error",
        message: "Invalid input data.",
      });
    }

    const { title, body, receiver, ...rest } = data;

    const messages: Message[] = [];
    const tokens: string[] = [];
    const userIds: string[] = [];

    switch (receiver) {
      case "admin": {
        console.log("SENDING TO ADMINS!");
        const users = await getUsers({ role: "admin" });

        if (users.length === 0) {
          return getSuccessResponse(userIds);
        }

        users.forEach((u) => {
          userIds.push(u.id);

          u.tokens.forEach((t) => {
            tokens.push(t);
            messages.push({
              token: t,
              data: {
                title,
                body,
                receiver: u.id,
                ...rest,
              },
            });
          });
        });

        break;
      }

      case "coach": {
        console.log("SENDING TO COACHES!");
        const users = await getUsers({ role: "coach" });

        if (users.length === 0) {
          return getSuccessResponse(userIds);
        }

        users.forEach((u) => {
          userIds.push(u.id);

          u.tokens.forEach((t) => {
            tokens.push(t);
            messages.push({
              token: t,
              data: {
                title,
                body,
                receiver: u.id,
                ...rest,
              },
            });
          });
        });

        break;
      }

      case "all": {
        console.log("SENDING TO ADMINS!");
        const users = await getUsers({ role: ["admin", "coach"] });

        if (users.length === 0) {
          return getSuccessResponse(userIds);
        }

        users.forEach((u) => {
          userIds.push(u.id);

          u.tokens.forEach((t) => {
            tokens.push(t);
            messages.push({
              token: t,
              data: {
                title,
                body,
                receiver: u.id,
                ...rest,
              },
            });
          });
        });

        break;
      }

      default: {
        console.log("SENDING TO USER IDS!");
        const users = await getUsers({ ids: receiver.split(",") });

        if (users.length === 0) {
          return getSuccessResponse(userIds);
        }

        users.forEach((u) => {
          userIds.push(u.id);

          u.tokens.forEach((t) => {
            tokens.push(t);
            messages.push({
              token: t,
              data: {
                title,
                body,
                receiver: u.id,
                ...rest,
              },
            });
          });
        });

        break;
      }
    }

    if (messages.length === 0) {
      return getSuccessResponse(userIds);
    }

    await messaging.sendEach(messages);

    return getSuccessResponse(userIds);
  } catch (error) {
    console.log("/api/send-notifcation error:", error);
    const err = getError(error);

    return getErrorResponse(err.message);
  }
}

export { HANDLER as POST };
