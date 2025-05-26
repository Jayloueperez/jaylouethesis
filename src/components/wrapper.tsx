"use client";

import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import _ from "lodash";

import { auth } from "~/lib/firebase/client";
import {
  createNotification,
  getUserRealtime,
  updateUser,
} from "~/lib/firebase/client/firestore";
import {
  getFCMToken,
  onFCMMessage,
  requestNotificationPermission,
} from "~/lib/firebase/client/messaging";
import { createNotificationInputSchema } from "~/schema/crud";
import { useAppDispatch, useAppSelector } from "~/store";
import { setUser } from "~/store/auth-slice";
import { setUserData } from "~/store/user-slice";

interface WrapperProps {
  children?: ReactNode;
}

function Wrapper(props: WrapperProps) {
  const { children } = props;

  const { user, loading, status } = useAppSelector((state) => state.auth);
  const {
    userData,
    loading: userLoading,
    status: userStatus,
  } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const isLoaded = loading === false && status === "fetched";
  const userLoaded = userLoading === false && userStatus === "fetched";

  useEffect(() => {
    onAuthStateChanged(auth, (u) => dispatch(setUser(u)));
  }, [dispatch]);

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      const unsubscribe = getUserRealtime(user.uid)((udata) =>
        dispatch(setUserData(udata)),
      );

      return unsubscribe;
    }

    dispatch(setUserData(null));
  }, [dispatch, isLoaded, user]);

  useEffect(() => {
    if (userLoaded && userData) {
      requestNotificationPermission().then((r) => {
        if (!r) return;

        getFCMToken().then(async (token) => {
          if (userData.tokens.includes(token)) return;

          await updateUser(userData.id, {
            tokens: _.uniq([...userData.tokens, token]),
          });
        });
      });
    }
  }, [userData, userLoaded]);

  useEffect(() => {
    const unsubscribe = onFCMMessage(async (n) => {
      const { success, data, error } = createNotificationInputSchema.safeParse(
        n.data,
      );

      if (!success) {
        return console.log("Invalid notification data.", error);
      }

      await createNotification(data);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isInstagram = userAgent.indexOf("Instagram") > -1;
    const isFacebook = userAgent.indexOf("FB_IAB") > -1;
    const isFacebookIphone = userAgent.indexOf("FBIOS") > -1;

    if (isInstagram || isFacebook || isFacebookIphone) {
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        window.location.href = `x-safari-${window.location.href}`;
        return;
      }

      window.location.href = `intent:${window.location.href}#Intent;end`;
      return;
    }
  }, []);

  return <>{children}</>;
}

export { Wrapper };
