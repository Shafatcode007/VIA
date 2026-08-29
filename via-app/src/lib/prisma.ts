// NECESSITY: This module exports a singleton PrismaClient instance. In Next.js, every hot-reload
// during development creates a new module context. Without a singleton, each reload spawns a new
// database connection, eventually exhausting the connection pool and crashing the dev server.
// LOGIC: We attach the PrismaClient to the global object in development (globalThis prisma) so
// that hot-reloads reuse the existing connection. In production, module caching handles this
// naturally, so we skip the globalThis assignment.
// EDGE-CASE: The `as unknown as` cast suppresses TypeScript's complaint about extending the
// `globalThis` type. Without it, TypeScript would throw a compile error because `prisma` is
// not a standard property of the global scope.
// PRISMA 7.x NOTE: Prisma 7.x requires a driver adapter. We use @prisma/adapter-libsql
// which provides a lightweight SQLite adapter for both local file and remote Turso databases.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// NECESSITY: The PrismaLibSql adapter bridges Prisma's query engine with the libSQL driver.
// This is required because Prisma 7.x removed the built-in query engine and relies on
// external driver adapters for database connectivity.
// LOGIC: PrismaLibSql accepts a config object with a `url` property pointing to the SQLite
// database. The adapter creates connections on demand and manages the connection pool.
// EDGE-CASE: If the database file doesn't exist, libsql creates it automatically.
const adapter = new PrismaLibSql({
  url: "file:dev.db",
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// LOGIC: If a global prisma instance already exists (from a previous hot-reload), reuse it.
// Otherwise, create a new PrismaClient with the libSQL adapter and store it globally.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// EDGE-CASE: Only pollute the global scope in development to avoid memory leaks in production
// where the module system handles singleton behavior automatically.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
