// NECESSITY: This debug script verifies that all required environment variables are loaded
// correctly by Node.js. It uses dotenv to load .env.local (same as Next.js does).
// LOGIC: Run this script with `npx tsx scripts/debug-env.ts` from the project root.
// It checks each required variable and reports its status (loaded/missing/truncated value).
// EDGE-CASE: If this script shows variables as undefined but they exist in .env.local,
// the issue is likely file encoding (UTF-8 with BOM) or invisible characters.

// NECESSITY: dotenv must be imported before accessing process.env to load .env.local.
import "dotenv/config";

console.log("============================================");
console.log("  VIA Auth Environment Variables Debug");
console.log("============================================\n");

// NECESSITY: We check each variable that Auth.js v5 requires. Missing any of these
// will cause the OAuth flow to fail with "invalid_client" or similar errors.
const requiredVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "AUTH_SECRET",
  "AUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "DATABASE_URL",
];

let hasErrors = false;

for (const varName of requiredVars) {
  const value = process.env[varName];

  if (!value) {
    console.log(`  [MISSING] ${varName}`);
    hasErrors = true;
  } else {
    // LOGIC: Show first 15 chars to verify the value looks correct without exposing secrets.
    const preview = value.length > 15 ? value.substring(0, 15) + "..." : value;
    console.log(`  [OK]      ${varName} = "${preview}"`);
  }
}

console.log("\n============================================");

if (hasErrors) {
  console.log("\n  Some variables are MISSING!");
  console.log("  Check your .env.local file in the project root.\n");
  process.exit(1);
} else {
  console.log("\n  All variables loaded successfully!\n");
}
