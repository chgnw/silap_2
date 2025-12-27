import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    console.log("🔒 Middleware triggered for:", pathname)

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Convert to number to handle both string and number cases
    const roleId = Number(token.role_id)

    console.log("🔒 Role ID:", roleId, "| Path:", pathname)

    // Admin (role_id = 1) - can only access /admin
    if (roleId === 1) {
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/driver")) {
        console.log("🚫 Admin blocked from", pathname, "-> redirecting to /admin")
        return NextResponse.redirect(new URL("/admin", req.url))
      }
    }

    // Customer (role_id = 2) - can only access /dashboard
    if (roleId === 2) {
      if (pathname.startsWith("/admin") || pathname.startsWith("/driver")) {
        console.log("🚫 Customer blocked from", pathname, "-> redirecting to /dashboard")
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Driver (role_id = 3) - can only access /driver
    if (roleId === 3) {
      if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
        console.log("🚫 Driver blocked from", pathname, "-> redirecting to /driver")
        return NextResponse.redirect(new URL("/driver", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/driver",
    "/driver/:path*"
  ],
}