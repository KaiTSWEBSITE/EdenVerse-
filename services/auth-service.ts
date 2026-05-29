import { authConfig } from "@/config/auth";
import { demoUsers } from "@/database/demo-data";
import { applyRateLimit } from "@/middleware/rate-limit";

const demoAccountPasswords = new Map<string, string>(
  [
    [authConfig.demoAdmin.email, authConfig.demoAdmin.password],
    [authConfig.demoUser.email, authConfig.demoUser.password]
  ].filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1]))
);

function allowDemoAuth() {
  return process.env.ENABLE_DEMO_AUTH === "true" || (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production");
}

export async function verifyCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const limited = applyRateLimit(`credentials:${normalizedEmail}`, {
    max: 8,
    windowMs: 15 * 60_000
  });

  if (!limited.success) {
    return null;
  }

  if (process.env.DATABASE_URL) {
    const [{ default: bcrypt }, { prisma }] = await Promise.all([import("bcryptjs"), import("@/database/prisma")]);
    const databaseUser = await prisma?.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (databaseUser?.passwordHash && (await bcrypt.compare(password, databaseUser.passwordHash))) {
      return {
        id: databaseUser.id,
        name: databaseUser.name,
        username: databaseUser.username,
        email: databaseUser.email,
        avatar: databaseUser.image ?? "/avatars/aria.svg",
        banner: databaseUser.banner ?? "/backgrounds/eden-cathedral.png",
        role: databaseUser.role,
        level: databaseUser.level,
        reputation: databaseUser.reputation,
        bio: databaseUser.bio ?? "",
        favoriteGames: [],
        savedGames: [],
        recentlyViewed: [],
        watchlist: [],
        allowMatureContent: databaseUser.allowMatureContent
      };
    }
  }

  if (!allowDemoAuth()) {
    return null;
  }

  const expectedPassword = demoAccountPasswords.get(normalizedEmail);
  if (!expectedPassword) {
    return null;
  }

  const user = demoUsers.find((entry) => entry.email === normalizedEmail);
  if (!user) {
    return null;
  }

  return password === expectedPassword ? user : null;
}
