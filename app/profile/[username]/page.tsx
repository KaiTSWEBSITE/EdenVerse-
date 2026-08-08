import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { getGameBySlug } from "@/services/game-service";
import { getUserByUsername } from "@/services/user-service";

function isGame(value: Awaited<ReturnType<typeof getGameBySlug>>): value is NonNullable<Awaited<ReturnType<typeof getGameBySlug>>> {
  return Boolean(value);
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return user
    ? {
        title: `${user.name} Profile`,
        description: user.bio
      }
    : {};
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) {
    notFound();
  }

  const favoriteGames = await Promise.all(user.favoriteGames.map(getGameBySlug));
  const savedGames = await Promise.all(user.savedGames.map(getGameBySlug));
  const recentGames = await Promise.all(user.recentlyViewed.map(getGameBySlug));
  const watchlistGames = await Promise.all(user.watchlist.map(getGameBySlug));

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <ProfileOverview
        user={user}
        favorites={favoriteGames.filter(isGame)}
        saved={savedGames.filter(isGame)}
        recent={recentGames.filter(isGame)}
        watchlist={watchlistGames.filter(isGame)}
      />
    </section>
  );
}
