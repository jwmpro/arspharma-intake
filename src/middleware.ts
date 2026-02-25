import { NextRequest, NextResponse } from "next/server";

/** Allowed origins for API requests */
function getAllowedOrigins(): string[] {
  const origins = [
    "https://gever-intake.netlify.app",
    "https://intake.geverhealth.com",
  ];
  // Allow localhost in development
  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000", "http://localhost:3077", "http://127.0.0.1:3000");
  }
  return origins;
}

/** Max request body size: 100 KB */
const MAX_BODY_SIZE = 100 * 1024;

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // --- Security headers (all routes) ---
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(self)"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.stripe.com",
      "frame-src https://challenges.cloudflare.com https://js.stripe.com",
      "connect-src 'self' https://*.stripe.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
    ].join("; ")
  );

  // --- API-specific protections ---
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    const allowed = getAllowedOrigins();

    // CORS: reject cross-origin requests from unknown origins
    if (origin && !allowed.includes(origin)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Set CORS headers for allowed origins
    if (origin && allowed.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }

    // Request body size limit (check Content-Length header)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|svg|webp|ico)).*)"],
};
