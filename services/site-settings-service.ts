import { prisma } from "@/database/prisma";

export const HERO_INTRO_SETTING_KEY = "heroIntro";

export const DEFAULT_HERO_INTRO =
  "Khám phá EdenVerse qua ba lối vào gọn gàng: game đang được tải nhiều, game vừa ra mắt và những lựa chọn chất lượng cao được cộng đồng đánh giá tốt.";

declare global {
  var __edenverseSiteSettings__: Map<string, string> | undefined;
}

const memorySettings = global.__edenverseSiteSettings__ ?? new Map<string, string>();
global.__edenverseSiteSettings__ = memorySettings;

export async function getSiteSetting(key: string, fallback: string) {
  if (prisma) {
    try {
      const rows = await prisma.$queryRaw<Array<{ value: string }>>`
        SELECT "value" FROM "SiteSetting" WHERE "key" = ${key} LIMIT 1
      `;
      const value = rows[0]?.value?.trim();

      if (value) {
        return value;
      }
    } catch {
      // The demo can run before migrations are applied, so fallback must stay safe.
    }
  }

  return memorySettings.get(key) ?? fallback;
}

export async function setSiteSetting(key: string, value: string) {
  const trimmedValue = value.trim();
  memorySettings.set(key, trimmedValue);

  if (!prisma) {
    return;
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
      VALUES (${key}, ${trimmedValue}, NOW())
      ON CONFLICT ("key")
      DO UPDATE SET "value" = ${trimmedValue}, "updatedAt" = NOW()
    `;
  } catch {
    // Keep the in-memory setting active even if the database is not migrated yet.
  }
}

export function getHeroIntroFallback() {
  return process.env.NEXT_PUBLIC_SITE_INTRO?.trim() || DEFAULT_HERO_INTRO;
}

export async function getHeroIntro() {
  return getSiteSetting(HERO_INTRO_SETTING_KEY, getHeroIntroFallback());
}

export async function setHeroIntro(value: string) {
  return setSiteSetting(HERO_INTRO_SETTING_KEY, value);
}
