import { useEffect, useState } from "react";

import {
  getNotificationsRealtime,
  getUsers,
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
      if (notifications.length === 0) return setNotifications([]);

      const userIds = notifications.map((n) => n.sender);
      const users = await getUsers({ ids: userIds });

      const notificationsWithUserMaybe = notificationsArr.map((n) => {
        const user = users.find((u) => u.id === n.sender);

        if (!user) return null;

        return {
          ...n,
          user,
        };
      });
      const notificationsWithUser = notificationsWithUserMaybe.filter(
        (n) => !!n,
      );

      setNotifications(notificationsWithUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [enabled, receiver, sender, notifications]);

  return { data: notifications, loading };
}

export { useNotifications };
