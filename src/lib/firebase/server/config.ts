import { env } from "~/env";

export const serviceAccount = {
  projectId: env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
  clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

export const config = {
  cookieName: env.FIREBASE_AUTH_COOKIE_NAME,
  cookieSignatureKeys: [
    env.FIREBASE_AUTH_SIGNATURE_KEY_PREVIOUS,
    env.FIREBASE_AUTH_SIGNATURE_KEY_CURRENT,
  ],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24,
  },
  serviceAccount,
};
