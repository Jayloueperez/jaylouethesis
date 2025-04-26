import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from "next-firebase-auth-edge";

import { config as clientConfig } from "./lib/firebase/client/config";
import { config as serverConfig } from "./lib/firebase/server/config";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/admin/login",
  "/coach/login",
  "/create-admin",
];

const PUBLIC_PATHS = ["/", "/about", ...AUTH_PATHS];

export default function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const redirect = searchParams.get("redirect");

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async (_tokens, headers) => {
      console.log("tokens:", _tokens);

      if (AUTH_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      if (redirect) return NextResponse.redirect(redirect);

      return NextResponse.next({
        request: { headers },
      });
    },
    handleInvalidToken: async (reason) => {
      console.log("Missing or malformed credentials", { reason });

      if (request.nextUrl.pathname.startsWith("/admin")) {
        return redirectToLogin(request, {
          path: "/admin/login",
          publicPaths: PUBLIC_PATHS,
        });
      }

      if (request.nextUrl.pathname.startsWith("/coach")) {
        return redirectToLogin(request, {
          path: "/coach/login",
          publicPaths: PUBLIC_PATHS,
        });
      }

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      });
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|favicon.ico|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};
