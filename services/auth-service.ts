import { authConfig } from "@/config/auth";
import { demoUsers } from "@/database/demo-data";

const demoAccountPasswords = new Map<string, string>(
  [
    [authConfig.demoAdmin.email, authConfig.demoAdmin.password],
    [authConfig.demoUser.email, authConfig.demoUser.password]
  ].map(([email, password]) => [email, password])
);

export async function verifyDemoCredentials(email: string, password: string) {
  if (process.env.DATABASE_URL) {
    const [{ default: bcrypt }, { prisma }] = await Promise.all([import("bcryptjs"), import("@/database/prisma")]);
    const databaseUser = await prisma?.user.findUnique({
      where: { email }
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

  const expectedPassword = demoAccountPasswords.get(email);
  if (!expectedPassword) {
    return null;
  }

  const user = demoUsers.find((entry) => entry.email === email);
  if (!user) {
    return null;
  }

  return password === expectedPassword ? user : null;
}
