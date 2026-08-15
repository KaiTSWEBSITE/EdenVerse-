import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { TAGS } from "@/constants/filters";
import { authConfig } from "@/config/auth";
import { demoComments, demoGames, demoReviews, demoUsers } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
import { slugify } from "@/lib/utils";
import { DEFAULT_HERO_INTRO, HERO_INTRO_SETTING_KEY } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (token !== "eden123456") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let connectionUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
    if (!connectionUrl) {
      return NextResponse.json({ message: "No DATABASE_URL detected." }, { status: 500 });
    }
    
    // Add connection timeout parameter to fix Neon sleep wake-up timeout
    if (connectionUrl.includes("?")) {
      connectionUrl += "&connect_timeout=30&pool_timeout=30";
    } else {
      connectionUrl += "?connect_timeout=30&pool_timeout=30";
    }

    const { PrismaClient } = require("@prisma/client");
    const client = new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl
        }
      }
    });

    const categories = [
      "Visual Novel", "Sandbox", "RPG", "Story Rich", "Dating Sim", 
      "Adult", "Choice Matter", "Anime Games", "Updates", "Editorial"
    ];

    // Wipe old data
    await client.comment.deleteMany();
    await client.review.deleteMany();
    await client.postTag.deleteMany();
    await client.post.deleteMany();
    await client.gameCategory.deleteMany();
    await client.gameGenre.deleteMany();
    await client.gameTag.deleteMany();
    await client.bookmark.deleteMany();
    await client.watchlist.deleteMany();
    await client.game.deleteMany();
    await client.tag.deleteMany();
    await client.category.deleteMany();
    await client.account.deleteMany();
    await client.session.deleteMany();
    await client.$executeRaw`DELETE FROM "SiteSetting"`;
    await client.user.deleteMany();

    // Re-seed tags and categories
    const tagRecords = await Promise.all(
      TAGS.map((tag) => client.tag.create({ data: { name: tag, slug: slugify(tag) } }))
    );

    const categoryRecords = await Promise.all(
      categories.map((category) => client.category.create({ data: { name: category, slug: slugify(category) } }))
    );

    // Re-seed users
    const userRecords = await Promise.all(
      demoUsers.map(async (user) =>
        client.user.create({
          data: {
            email: user.email,
            username: user.username,
            name: user.name,
            image: user.avatar,
            banner: user.banner,
            bio: user.bio,
            role: user.role,
            level: user.level,
            reputation: user.reputation,
            allowMatureContent: user.allowMatureContent,
            passwordHash: await bcrypt.hash(
              user.email === authConfig.demoAdmin.email ? authConfig.demoAdmin.password : authConfig.demoUser.password,
              10
            )
          }
        })
      )
    );

    const categoryByName = new Map(categoryRecords.map((category) => [category.name, category]));
    const tagByName = new Map(tagRecords.map((tag) => [tag.name, tag]));

    // Re-seed games
    for (const game of demoGames) {
      const created = await client.game.create({
        data: {
          slug: game.slug,
          title: game.title,
          tagline: game.tagline,
          shortDescription: game.shortDescription,
          description: game.description,
          story: game.story,
          version: game.version,
          developer: game.developer,
          engine: game.engine,
          releaseDate: new Date(game.releaseDate),
          trailerUrl: game.trailerUrl,
          mature: game.mature,
          featured: game.featured,
          hero: game.hero,
          coverImage: game.coverImage,
          bannerImage: game.bannerImage,
          gallery: game.gallery,
          platforms: game.platforms,
          languages: game.languages,
          rating: game.rating,
          reviewCount: game.reviewCount,
          popularityScore: game.popularityScore,
          bookmarksCount: game.bookmarks,
          downloadsCount: game.downloads
        }
      });

      await Promise.all(
        game.genres.map((genre) => client.gameGenre.create({ data: { gameId: created.id, genre } }))
      );

      await Promise.all(
        game.tags.map((tag) =>
          client.gameTag.create({
            data: { gameId: created.id, tagId: tagByName.get(tag)?.id ?? tagRecords[0].id }
          })
        )
      );

      const relatedCategories = Array.from(
        new Set(game.genres.includes("Visual Novel") ? ["Visual Novel", game.mature ? "Adult" : "Story Rich"] : [game.genres[0]])
      );

      await Promise.all(
        relatedCategories.map((name) =>
          client.gameCategory.create({
            data: { gameId: created.id, categoryId: categoryByName.get(name)?.id ?? categoryRecords[0].id }
          })
        )
      );
    }

    const gameMap = new Map((await client.game.findMany()).map((game: any) => [game.slug, game]));
    const userMap = new Map(userRecords.map((user: any) => [user.username, user]));

    // Re-seed reviews
    for (const review of demoReviews) {
      await client.review.create({
        data: {
          title: review.title,
          body: review.body,
          rating: review.rating,
          helpful: review.helpful,
          gameId: gameMap.get(review.gameSlug)?.id ?? Array.from(gameMap.values())[0].id,
          authorId: userMap.get(review.author.username)?.id ?? userRecords[0].id
        }
      });
    }

    // Re-seed comments
    for (const comment of demoComments) {
      const created = await client.comment.create({
        data: {
          body: comment.body,
          likes: comment.likes,
          reports: comment.reports,
          gameId: comment.gameSlug ? gameMap.get(comment.gameSlug)?.id : undefined,
          authorId: userMap.get(comment.author.username)?.id ?? userRecords[0].id
        }
      });

      for (const reply of comment.replies ?? []) {
        await client.comment.create({
          data: {
            body: reply.body,
            likes: reply.likes,
            reports: reply.reports,
            parentId: created.id,
            gameId: reply.gameSlug ? gameMap.get(reply.gameSlug)?.id : undefined,
            authorId: userMap.get(reply.author.username)?.id ?? userRecords[0].id
          }
        });
      }
    }

    await client.$executeRaw`
      INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
      VALUES (${HERO_INTRO_SETTING_KEY}, ${DEFAULT_HERO_INTRO}, NOW())
      ON CONFLICT ("key")
      DO UPDATE SET "value" = ${DEFAULT_HERO_INTRO}, "updatedAt" = NOW()
    `;

    return NextResponse.json({ message: "Seed successful!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
