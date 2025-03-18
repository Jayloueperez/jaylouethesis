import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

import { serviceAccount } from "./config";

export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({ credential: cert(serviceAccount) });
export const firestore = getFirestore(app);
export const messaging = getMessaging(app);
