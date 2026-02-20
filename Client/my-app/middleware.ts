import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Cookie se token nikalna (Server-side)
  const token = request.cookies.get("token")?.value;

  // Agar user dashboard par hai aur token nahi hai
  if (request.nextUrl.pathname.startsWith("/homePage")) {
    if (!token) {
      // Login page par redirect kar do
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Ye middleware sirf in pages par chalega
export const config = {
  matcher: ["/homePage/:path*"],
};
