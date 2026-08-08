import { demoUsers } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
import type { UserProfile } from "@/types";

type DatabaseUser = NonNullable<Awaited<ReturnType<typeof getDatabaseUserByUsername>>>;

function toPublicProfile(user: DatabaseUser): UserProfile {
  const savedGames = user.bookmarks.map((bookmark) => bookmark.game.slug);
  const watchlist = user.watchlist.map((entry) => entry.game.slug);
  const recentlyViewed = user.reviews.map((review) => review.game.slug);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatar: user.image ?? "/avatars/aria.svg",
    banner: user.banner ?? "/backgrounds/eden-cathedral.png",
    role: user.role,
    level: user.level,
    reputation: user.reputation,
    bio: user.bio ?? "Thành viên EdenVerse.",
    favoriteGames: savedGames.slice(0, 4),
    savedGames,
    recentlyViewed,
    watchlist,
    allowMatureContent: user.allowMatureContent
  };
}

async function getDatabaseUserByUsername(username: string) {
  if (!prisma) {
    return null;
  }

  try {
    return prisma.user.findUnique({
      where: { username },
      include: {
        bookmarks: {
          include: {
            game: {
              select: {
                slug: true
              }
            }
          },
          take: 12,
          orderBy: { createdAt: "desc" }
        },
        watchlist: {
          include: {
            game: {
              select: {
                slug: true
              }
            }
          },
          take: 12,
          orderBy: { createdAt: "desc" }
        },
        reviews: {
          include: {
            game: {
              select: {
                slug: true
              }
            }
          },
          take: 12,
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch {
    return null;
  }
}

export async function getUserByUsername(username: string) {
  const databaseUser = await getDatabaseUserByUsername(username);
  if (databaseUser) {
    return toPublicProfile(databaseUser);
  }

  return demoUsers.find((user) => user.username === username) ?? null;
}

export async function getAllUsers() {
  if (prisma) {
    try {
      const users = await prisma.user.findMany({
        orderBy: [{ role: "desc" }, { reputation: "desc" }, { createdAt: "desc" }],
        include: {
          bookmarks: {
            include: {
              game: {
                select: {
                  slug: true
                }
              }
            },
            take: 12,
            orderBy: { createdAt: "desc" }
          },
          watchlist: {
            include: {
              game: {
                select: {
                  slug: true
                }
              }
            },
            take: 12,
            orderBy: { createdAt: "desc" }
          },
          reviews: {
            include: {
              game: {
                select: {
                  slug: true
                }
              }
            },
            take: 12,
            orderBy: { createdAt: "desc" }
          }
        },
        take: 50
      });

      return users.map(toPublicProfile);
    } catch {
      return [];
    }
  }

  return demoUsers;
}

export async function getAdminUsers() {
  return (await getAllUsers()).filter((user) => ["ADMIN", "SUPER_ADMIN"].includes(user.role));
}
