import { NextRequest, NextResponse } from "next/server";
import { Message } from "firebase-admin/messaging";

import { messaging } from "~/lib/firebase/server";
import { createNotificationInputSchema } from "~/schema/crud";
import { getError } from "~/utils/error";

const HANDLER = async (request: NextRequest) => {
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

    // const { tokens, ...restData } = data;

    // const messages = tokens.map(
    //   (t) =>
    //     ({
    //       token: t,
    //       data: restData,
    //     }) satisfies Message,
    // );

    // await messaging.sendEach(messages);

    return NextResponse.json({
      type: "success",
      data: true,
    });
  } catch (error) {
    console.log("/api/send-notifcation error:", error);
    const err = getError(error);

    return NextResponse.json({
      type: "error",
      message: err.message,
    });
  }
};

export { HANDLER as POST };
