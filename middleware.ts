import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token");
  const orgId = req.cookies.get("organizationId");

  const { pathname } = req.nextUrl;

  const publicRoutes = ["/sign-in", "/register"];
  const selectOrganizationRoute = "/select-organization";

  const isPublicRoute = publicRoutes.includes(pathname);
  const isSelectOrgRoute = pathname.startsWith(selectOrganizationRoute);
  const isPrivateRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  if (!token && (isPrivateRoute || isSelectOrgRoute)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (token && !orgId && isPrivateRoute) {
    return NextResponse.redirect(new URL(selectOrganizationRoute, req.url));
  }

  if (token && pathname === "/sign-in") {
    if (orgId) {
      return NextResponse.redirect(new URL(`/dashboard/${orgId}`, req.url));
    }
    return NextResponse.redirect(new URL(selectOrganizationRoute, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
