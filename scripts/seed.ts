import bcrypt from "bcryptjs";
import { TAGS } from "../constants/filters";
import { authConfig } from "../config/auth";
import { demoComments, demoGames, demoReviews, demoUsers } from "../database/demo-data";
import { prisma } from "../database/prisma";
import { slugify } from "../lib/utils";
import { DEFAULT_HERO_INTRO, HERO_INTRO_SETTING_KEY } from "../services/site-settings-service";

async function seed() {
  const client = prisma;

  if (!client) {
    console.log("No DATABASE_URL detected. Demo fallback data is already available to the app.");
    return;
  }

  const categories = [
    "Visual Novel",
    "Sandbox",
    "RPG",
    "Story Rich",
    "Dating Sim",
    "Adult",
    "Choice Matter",
    "Anime Games",
    "Updates",
    "Editorial"
  ];

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

  const tagRecords = await Promise.all(
    TAGS.map((tag) =>
      client.tag.create({
        data: { name: tag, slug: slugify(tag) }
      })
    )
  );

  const categoryRecords = await Promise.all(
    categories.map((category) =>
      client.category.create({
        data: { name: category, slug: slugify(category) }
      })
    )
  );

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
        rating: game.rating,
        reviewCount: game.reviewCount,
        popularityScore: game.popularityScore,
        bookmarksCount: game.bookmarks,
        downloadsCount: game.downloads
      }
    });

    await Promise.all(
      game.genres.map((genre) =>
        client.gameGenre.create({
          data: {
            gameId: created.id,
            genre
          }
        })
      )
    );

    await Promise.all(
      game.tags.map((tag) =>
        client.gameTag.create({
          data: {
            gameId: created.id,
            tagId: tagByName.get(tag)?.id ?? tagRecords[0].id
          }
        })
      )
    );

    const relatedCategories = Array.from(
      new Set(game.genres.includes("Visual Novel") ? ["Visual Novel", game.mature ? "Adult" : "Story Rich"] : [game.genres[0]])
    );

    await Promise.all(
      relatedCategories.map((name) =>
        client.gameCategory.create({
          data: {
            gameId: created.id,
            categoryId: categoryByName.get(name)?.id ?? categoryRecords[0].id
          }
        })
      )
    );
  }

  const gameMap = new Map((await client.game.findMany()).map((game) => [game.slug, game]));
  const userMap = new Map(userRecords.map((user) => [user.username, user]));

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

  console.log("EdenVerse seed complete.");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
