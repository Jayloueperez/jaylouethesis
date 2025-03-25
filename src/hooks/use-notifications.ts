import { useEffect, useState } from "react";

import {
  getNotificationsRealtime,
  getUser,
} from "~/lib/firebase/client/firestore";
import { NotificationSchema, UserSchema } from "~/schema/data-client";

interface UseNotificationsParams {
  sender?: string;
  receiver?: string;
  enabled?: boolean;
}

function useNotifications(params: UseNotificationsParams) {
  const { receiver, sender, enabled } = params ?? {};

  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<
    (NotificationSchema & { user: UserSchema })[]
  >([]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = getNotificationsRealtime({ receiver, sender })(async (
      notificationsArr,
    ) => {
      const promises = await notificationsArr.map(async (n) => {
        const user = await getUser(n.sender);

        return { ...n, user };
      });

      const result = await Promise.all(promises);
      setNotifications(result);
      setLoading(false);
    });

    return unsubscribe;
  }, [enabled, receiver, sender]);

  return { data: notifications, loading };
}

export { useNotifications };
