import { PrismaClient } from "@prisma/client";

declare global {
  var __edenversePrisma__: PrismaClient | undefined;
}

function shouldUsePrisma() {
  return Boolean(process.env.DATABASE_URL);
}

export const prisma =
  shouldUsePrisma()
    ? global.__edenversePrisma__ ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
      })
    : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  global.__edenversePrisma__ = prisma;
}
