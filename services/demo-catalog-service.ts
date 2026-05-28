import { cookies } from "next/headers";
import { prisma } from "@/database/prisma";

export const HIDE_DEMO_CATALOG_COOKIE = "edenverse_hide_demo_catalog";
export const HIDE_DEMO_CATALOG_SETTING_KEY = "edenverse.hideDemoCatalog";

export async function isDemoCatalogHidden() {
  if (process.env.ENABLE_PRISMA_DEMO_FALLBACK === "false") {
    return true;
  }

  try {
    const cookieStore = await cookies();
    if (cookieStore.get(HIDE_DEMO_CATALOG_COOKIE)?.value === "1") {
      return true;
    }
  } catch {
    // Some generated routes run outside a request scope, so cookies may be unavailable.
  }

  if (!prisma) {
    return false;
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ value: string }>>`
      SELECT "value" FROM "SiteSetting" WHERE "key" = ${HIDE_DEMO_CATALOG_SETTING_KEY} LIMIT 1
    `;
    const setting = rows[0]?.value?.trim();

    return setting === "true";
  } catch {
    return false;
  }
}
