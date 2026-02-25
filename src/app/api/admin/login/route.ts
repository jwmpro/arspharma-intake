import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const expectedToken = process.env.ADMIN_LOG_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", expectedToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
