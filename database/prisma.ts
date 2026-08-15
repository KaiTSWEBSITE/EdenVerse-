import { PrismaClient } from "@prisma/client";

declare global {
  var __edenversePrisma__: PrismaClient | undefined;
}

function shouldUsePrisma() {
  if (process.env.CI === "true" && process.env.ENABLE_PRISMA_DEMO_FALLBACK === "true") {
    return false;
  }

  return Boolean(process.env.DATABASE_URL);
}

function getPrismaUrl() {
  let url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (url) {
    if (url.includes("?")) {
      if (!url.includes("connect_timeout")) url += "&connect_timeout=30";
      if (!url.includes("pool_timeout")) url += "&pool_timeout=30";
    } else {
      url += "?connect_timeout=30&pool_timeout=30";
    }
  }
  return url;
}

export const prisma =
  shouldUsePrisma()
    ? global.__edenversePrisma__ ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
        datasources: {
          db: {
            url: getPrismaUrl()
          }
        }
      })
    : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  global.__edenversePrisma__ = prisma;
}
