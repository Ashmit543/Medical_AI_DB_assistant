import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/patients", "/upload", "/chat"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isProtected = PROTECTED_PATHS.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

