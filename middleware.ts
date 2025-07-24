import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/auth"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  console.log("Middleware - isAuthenticated:", isAuthenticated, "path:", request.nextUrl.pathname);
  
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