import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { config } from "./config";

export const googleProvider = new GoogleAuthProvider();

export const app = initializeApp(config);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const app2 = initializeApp(config, "app2");
export const auth2 = getAuth(app2);
