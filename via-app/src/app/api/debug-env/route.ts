// NECESSITY: This API route provides a quick way to verify env vars are loaded in the
// Next.js server context. Visit /api/debug-env in the browser to check.
// LOGIC: The route reads process.env and returns a JSON object showing which variables
// are loaded (first 10 chars only) and which are missing.
// EDGE-CASE: This route should be removed before deploying to production since it
// exposes partial credential information.

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
      ? process.env.GOOGLE_CLIENT_ID.substring(0, 15) + "..."
      : "MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + "..."
      : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? "LOADED" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "LOADED" : "MISSING",
    AUTH_URL: process.env.AUTH_URL || "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 15) + "..."
      : "MISSING",
  });
}
