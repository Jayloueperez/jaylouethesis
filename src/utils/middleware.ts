import { NextRequest, NextResponse } from "next/server";

export type PublicPath = string | RegExp;

export interface RedirectToLoginOptions {
  path: string;
  publicPaths: PublicPath[];
  redirectParamKeyName?: string;
}

function doesRequestPathnameMatchPublicPath(
  request: NextRequest,
  publicPath: PublicPath,
) {
  if (typeof publicPath === "string") {
    return publicPath === request.nextUrl.pathname;
  }
  return publicPath.test(request.nextUrl.pathname);
}

function doesRequestPathnameMatchOneOfPublicPaths(
  request: NextRequest,
  publicPaths: PublicPath[],
) {
  return publicPaths.some((path) =>
    doesRequestPathnameMatchPublicPath(request, path),
  );
}

export function redirectToLogin(
  request: NextRequest,
  options: RedirectToLoginOptions = {
    path: "/login",
    publicPaths: ["/login"],
  },
) {
  const redirectKey = options.redirectParamKeyName || "redirect";

  if (doesRequestPathnameMatchOneOfPublicPaths(request, options.publicPaths)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  url.pathname = options.path;
  url.search = `${redirectKey}=${request.nextUrl.pathname}${url.search}`;

  return NextResponse.redirect(url);
}

export function redirectToLoginByRole(
  request: NextRequest,
  options: RedirectToLoginOptions = {
    path: "/login",
    publicPaths: ["/login"],
  },
) {
  const redirectKey = options.redirectParamKeyName || "redirect";

  if (doesRequestPathnameMatchOneOfPublicPaths(request, options.publicPaths)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  url.pathname = options.path;
  url.search = `${redirectKey}=${request.nextUrl.pathname}${url.search}`;

  return NextResponse.redirect(url);
}
