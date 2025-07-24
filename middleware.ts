import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/auth"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  const token = await convexAuth.getToken();

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Path:", request.nextUrl.pathname);
  console.log("Method:", request.method);
  console.log("Is Authenticated:", isAuthenticated);
  console.log("Token exists:", !!token);
  console.log("Request cookies:", request.cookies.getAll());
  console.log("========================");

  if (isSignInPage(request) && isAuthenticated) {
    console.log("Redirecting authenticated user to dashboard");
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  if (isProtectedRoute(request) && !isAuthenticated) {
    console.log("Redirecting unauthenticated user to auth");
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};