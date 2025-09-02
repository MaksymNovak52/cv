import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const token = req.cookies.get("sb-access-token");

  const { pathname } = req.nextUrl;

  const publicRoutes = ["/sign-in", "/register"];
  const privateRoutes = ["/dashboard", "/settings"];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && isPrivateRoute) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (token && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
