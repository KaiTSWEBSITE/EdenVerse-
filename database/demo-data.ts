import { ENGINES } from "@/constants/filters";
import type { Comment, Game, Post, Review, UserProfile, UserSummary } from "@/types";
import { slugify } from "@/lib/utils";

const coverPool = [
  "/games/cathedral-01.svg",
  "/games/cathedral-02.svg",
  "/games/cathedral-03.svg",
  "/games/cathedral-04.svg",
  "/games/cathedral-05.svg",
  "/games/cathedral-06.svg"
];

const screenshotPool = [
  "/screenshots/scene-01.svg",
  "/screenshots/scene-02.svg",
  "/screenshots/scene-03.svg",
  "/screenshots/scene-04.svg"
];

const banners = [
  "/backgrounds/eden-cathedral.png",
  "/screenshots/scene-03.svg",
  "/screenshots/scene-04.svg"
];

const userSeed = [
  {
    id: "user-aria",
    name: "Aria Noctis",
    username: "aria",
    email: "aria@edenverse.gg",
    avatar: "/avatars/aria.svg",
    banner: banners[0],
    role: "USER",
    level: 18,
    reputation: 1240,
    bio: "Choice-matter obsessive with a weak spot for cathedral horror, elite romance routes, and elegant stat systems.",
    favoriteGames: ["eternum-reverie", "blackthorn-protocol", "crown-of-ashes"],
    savedGames: ["moonfall-sanctum", "glass-eclipse", "saints-of-afterglow"],
    recentlyViewed: ["cathedral-zero", "vowbound-horizon", "lilac-sin"],
    watchlist: ["seraph-code", "ember-rite"],
    allowMatureContent: true
  },
  {
    id: "user-sol",
    name: "Sol Veyra",
    username: "sol",
    email: "sol@edenverse.gg",
    avatar: "/avatars/sol.svg",
    banner: banners[1],
    role: "MODERATOR",
    level: 27,
    reputation: 2840,
    bio: "Moderator for lore-heavy RPGs and slow-burn relationship routes. Keeps sandbox chaos civilized.",
    favoriteGames: ["seraph-code", "moonlit-oblivion", "velvet-hollow"],
    savedGames: ["cathedral-zero", "thorn-sleep"],
    recentlyViewed: ["bloodline-nocture", "ashen-waltz"],
    watchlist: ["echoes-of-the-red-garden"],
    allowMatureContent: true
  },
  {
    id: "user-lyra",
    name: "Lyra Vael",
    username: "lyra",
    email: "lyra@edenverse.gg",
    avatar: "/avatars/lyra.svg",
    banner: banners[2],
    role: "USER",
    level: 11,
    reputation: 870,
    bio: "Collects hidden gems, writes spoiler-light reviews, and hunts for premium UI in every launcher.",
    favoriteGames: ["vowbound-horizon", "midnight-museum", "glass-eclipse"],
    savedGames: ["heir-of-the-sable-star", "ashen-waltz"],
    recentlyViewed: ["seraph-code", "saints-of-afterglow"],
    watchlist: ["moonfall-sanctum"],
    allowMatureContent: false
  },
  {
    id: "user-riven",
    name: "Riven Hart",
    username: "riven",
    email: "riven@edenverse.gg",
    avatar: "/avatars/riven.svg",
    banner: banners[0],
    role: "ADMIN",
    level: 32,
    reputation: 4160,
    bio: "Curator for dark-fantasy VNs, adult content policy, and all things premium presentation.",
    favoriteGames: ["embers-of-eden", "cathedral-zero", "seraph-code"],
    savedGames: ["crown-of-ashes", "thorn-sleep"],
    recentlyViewed: ["eclipsed-vows", "hollow-vantage"],
    watchlist: ["relics-of-lucent-night"],
    allowMatureContent: true
  },
  {
    id: "user-admin",
    name: "Eden Archivist",
    username: "admin",
    email: "admin@edenverse.gg",
    avatar: "/avatars/archivist.svg",
    banner: banners[1],
    role: "SUPER_ADMIN",
    level: 99,
    reputation: 9999,
    bio: "Super admin account used for moderation, editorial publishing, and platform curation.",
    favoriteGames: ["embers-of-eden", "eternum-reverie", "moonfall-sanctum"],
    savedGames: ["blackthorn-protocol", "crown-of-ashes"],
    recentlyViewed: ["glass-eclipse", "vowbound-horizon"],
    watchlist: ["seraph-code"],
    allowMatureContent: true
  }
] as const satisfies UserProfile[];

const userLookup = new Map<string, UserProfile>(userSeed.map((user) => [user.id, user]));

const roster = [
  {
    title: "Eternum Reverie",
    tagline: "A velvet-noir campus VN where every confession rewrites the timeline.",
    developer: "Lunaris Atelier",
    engine: "Ren'Py",
    releaseDate: "2026-03-02",
    updatedAt: "2026-05-18",
    rating: 9.4,
    reviewCount: 1840,
    popularityScore: 98300,
    bookmarks: 6820,
    downloads: 45120,
    mature: true,
    featured: true,
    hero: true,
    genres: ["Visual Novel", "Story Rich", "Dating Sim"],
    tags: ["18+", "Romance", "College", "Choice Matter"],
    platforms: ["Windows", "macOS", "Linux"],
    languages: ["English", "Japanese"],
    story:
      "When a scholarship drags you into the elite Saint Vesper Academy, you discover a hidden society using memories as currency.",
    shortDescription:
      "Premium branching visual novel with rich romance routes, cinematic presentation, and political seduction.",
    description:
      "Eternum Reverie layers gilded campus drama, occult conspiracies, and daring adult storytelling into a highly reactive choice-matter structure. Every route unlocks hidden social circles, private investigations, and faction-ending consequences.",
    trailerUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4"
  },
  {
    title: "Blackthorn Protocol",
    tagline: "Cyber-gothic espionage across a city ruled by masked saints and syndicates.",
    developer: "Obsidian Swan",
    engine: "Unity",
    releaseDate: "2025-12-11",
    updatedAt: "2026-05-20",
    rating: 9.1,
    reviewCount: 1204,
    popularityScore: 87920,
    bookmarks: 5432,
    downloads: 32218,
    mature: false,
    featured: true,
    hero: false,
    genres: ["Visual Novel", "Choice Matter", "Mystery"],
    tags: ["Cyberpunk", "Detective", "Heist"],
    platforms: ["Windows", "Steam Deck"],
    languages: ["English"],
    story:
      "A disgraced profiler is blackmailed into infiltrating a cathedral-sized datavault hidden beneath the city.",
    shortDescription: "Detective VN with sleek tactical choices, heist routes, and premium noir styling.",
    description:
      "Blackthorn Protocol balances relationship systems, infiltration planning, and a moral ledger that changes every ending. Investigations can be approached through diplomacy, seduction, or carefully staged betrayals.",
    trailerUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U"
  },
  {
    title: "Crown of Ashes",
    tagline: "Rule a ruined empire where each alliance tastes like devotion and poison.",
    developer: "Velour Forge",
    engine: "Ren'Py",
    releaseDate: "2025-10-08",
    updatedAt: "2026-04-29",
    rating: 9.3,
    reviewCount: 2011,
    popularityScore: 91300,
    bookmarks: 6140,
    downloads: 38400,
    mature: true,
    featured: true,
    hero: false,
    genres: ["RPG", "Story Rich", "Dating Sim"],
    tags: ["Fantasy", "Political Intrigue", "Morality"],
    platforms: ["Windows", "macOS"],
    languages: ["English", "Spanish"],
    story:
      "You inherit a throne cursed to consume its monarch unless seven rival houses pledge more than loyalty.",
    shortDescription: "A dark-fantasy throne sim with branching romances, kingdom stats, and dangerous vows.",
    description:
      "Courtly seduction meets grim resource management as Crown of Ashes pushes you through war councils, divine bargains, and intimate route-specific endings. Decisions reshape both map control and character trust.",
    trailerUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  },
  {
    title: "Moonfall Sanctum",
    tagline: "A monastery sandbox where secrets bloom after midnight prayers.",
    developer: "Nocturne Vale",
    engine: "Ren'Py",
    releaseDate: "2025-09-14",
    updatedAt: "2026-05-21",
    rating: 8.9,
    reviewCount: 990,
    popularityScore: 73280,
    bookmarks: 4822,
    downloads: 28732,
    mature: true,
    featured: false,
    hero: false,
    genres: ["Sandbox", "Visual Novel", "Story Rich"],
    tags: ["18+", "Fantasy", "Mystery"],
    platforms: ["Windows", "Android"],
    languages: ["English", "Portuguese"],
    story:
      "Assigned as the sanctum's new chronicler, you unravel oaths, rituals, and forbidden corridors of affection.",
    shortDescription: "Adult sandbox VN with a slow-burn monastery mystery and lavish night-cycle events.",
    description:
      "Moonfall Sanctum uses a layered schedule system, faction-driven affection gates, and a gorgeously oppressive abbey setting. Every chapel, dormitory, and hidden archive can shift the tone of your journey.",
    trailerUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
  },
  {
    title: "Glass Eclipse",
    tagline: "A premium launcher-style VN set inside a city of mirrored cathedrals.",
    developer: "Pale Anthem",
    engine: "Unreal Engine",
    releaseDate: "2026-01-19",
    updatedAt: "2026-05-24",
    rating: 9.0,
    reviewCount: 860,
    popularityScore: 69810,
    bookmarks: 4186,
    downloads: 25319,
    mature: false,
    featured: false,
    hero: false,
    genres: ["Visual Novel", "Anime Games", "Story Rich"],
    tags: ["Fantasy", "Mystery", "Magic Academy"],
    platforms: ["Windows"],
    languages: ["English", "French"],
    story:
      "A transfer student can hear glass sing when lies are spoken, drawing them into a conspiracy of mirrored saints.",
    shortDescription: "Elegant academy mystery with polished UI, route-based clues, and cathedral-glow vibes.",
    description:
      "Glass Eclipse is built around investigative route locks, premium interface motion, and luminous environments. The more relationships you deepen, the more hidden districts and unreleased memories appear.",
    trailerUrl: "https://www.youtube.com/watch?v=YQHsXMglC9A"
  },
  {
    title: "Seraph Code",
    tagline: "A sandbox RPG where forbidden angels descend through corrupted network shrines.",
    developer: "Aurelian Grid",
    engine: "Godot",
    releaseDate: "2026-02-26",
    updatedAt: "2026-05-25",
    rating: 9.5,
    reviewCount: 2240,
    popularityScore: 101200,
    bookmarks: 7720,
    downloads: 49840,
    mature: true,
    featured: true,
    hero: false,
    genres: ["Sandbox", "RPG", "Choice Matter"],
    tags: ["18+", "Open World", "Cyberpunk", "Companion Routes"],
    platforms: ["Windows", "Linux"],
    languages: ["English", "German"],
    story:
      "As a relic courier with an illegal halo graft, you roam a shattered megacity collecting angels, debts, and dangerous promises.",
    shortDescription: "Open-ended adult RPG with lush districts, companion routes, and kinetic cathedral sci-fi.",
    description:
      "Seraph Code offers a dense district sandbox, branching combat diplomacy, and a layered intimacy system. The city reacts to faction heat, moral choices, and how openly you use illicit celestial powers.",
    trailerUrl: "https://www.youtube.com/watch?v=6ZfuNTqbHE8"
  },
  {
    title: "Cathedral Zero",
    tagline: "A post-ruin mystery where the last stained-glass oracle still remembers your face.",
    developer: "Ruin Choir",
    engine: "Ren'Py",
    releaseDate: "2025-07-18",
    updatedAt: "2026-05-14",
    rating: 8.8,
    reviewCount: 641,
    popularityScore: 62010,
    bookmarks: 3180,
    downloads: 19000,
    mature: false,
    featured: false,
    hero: false,
    genres: ["Visual Novel", "Mystery", "Story Rich"],
    tags: ["Fantasy", "Time Loop", "Detective"],
    platforms: ["Windows", "macOS", "Linux"],
    languages: ["English"],
    story:
      "You wake in a silent basilica at the edge of the world, and every answer arrives one loop too late.",
    shortDescription: "Loop-driven mystery VN with radiant clues, haunting ambience, and elite atmosphere.",
    description:
      "Cathedral Zero focuses on deduction, route memory carryover, and layered environmental storytelling. It rewards attentive reading with sequence-breaking reveals and deeply melancholic endings.",
    trailerUrl: "https://www.youtube.com/watch?v=C0DPdy98e4c"
  },
  {
    title: "Vowbound Horizon",
    tagline: "A starship court drama for players who want romance, law, and mutiny in equal measure.",
    developer: "Argent Chapel",
    engine: "Unity",
    releaseDate: "2025-11-03",
    updatedAt: "2026-05-12",
    rating: 8.7,
    reviewCount: 780,
    popularityScore: 64080,
    bookmarks: 3310,
    downloads: 20420,
    mature: false,
    featured: false,
    hero: false,
    genres: ["Story Rich", "Dating Sim", "Anime Games"],
    tags: ["Political Intrigue", "Companion Routes", "Morality"],
    platforms: ["Windows"],
    languages: ["English"],
    story:
      "Named provisional heir aboard a drifting colony cathedral, you mediate civil war through law, love, and spectacle.",
    shortDescription: "Starship succession drama with polished route writing and tightly reactive politics.",
    description:
      "Vowbound Horizon blends legal debate systems, trust thresholds, and lush star-gothic set pieces. Relationships influence senate votes, escape sequences, and the final architecture of your regime.",
    trailerUrl: "https://www.youtube.com/watch?v=fLexgOxsZu0"
  },
  {
    title: "Lilac Sin",
    tagline: "A hidden gem about temptation, theatre, and cursed applause.",
    developer: "Velvet Hex",
    engine: "Ren'Py",
    releaseDate: "2025-08-06",
    updatedAt: "2026-05-17",
    rating: 8.6,
    reviewCount: 514,
    popularityScore: 55210,
    bookmarks: 2544,
    downloads: 16210,
    mature: true,
    featured: false,
    hero: false,
    genres: ["Visual Novel", "Dating Sim", "Story Rich"],
    tags: ["18+", "Romance", "Mystery"],
    platforms: ["Windows", "Android"],
    languages: ["English"],
    story:
      "A masked theater troupe promises fame if you agree to play the role the previous lead died performing.",
    shortDescription: "Sensual theatre horror with route-exclusive scenes, elite styling, and strong character voice.",
    description:
      "Lilac Sin excels at intimate stakes, musical mood, and soft-surreal route escalation. Behind its velvet glamour is a ruthless system of bargains that punishes careless ambition.",
    trailerUrl: "https://www.youtube.com/watch?v=kXYiU_JCYtU"
  },
  {
    title: "Saints of Afterglow",
    tagline: "A melancholy survival RPG inside a city lit only by relic embers.",
    developer: "Afterglow Works",
    engine: "RPG Maker",
    releaseDate: "2025-05-14",
    updatedAt: "2026-05-08",
    rating: 8.5,
    reviewCount: 401,
    popularityScore: 48000,
    bookmarks: 2199,
    downloads: 14850,
    mature: false,
    featured: false,
    hero: false,
    genres: ["RPG", "Story Rich", "Adventure"],
    tags: ["Survival", "Fantasy", "Morality"],
    platforms: ["Windows"],
    languages: ["English"],
    story:
      "Gather a pilgrimage of broken saints and ration dwindling embers across a map that remembers your lies.",
    shortDescription: "Harsh but emotional RPG with party trust mechanics and unforgettable atmosphere.",
    description:
      "Saints of Afterglow makes survival feel personal through companion thresholds, route-partitioned towns, and ambient writing that rewards slow exploration.",
    trailerUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g"
  }
];

const extraTitles = [
  "Moonlit Oblivion",
  "Velvet Hollow",
  "Thorn Sleep",
  "Bloodline Nocture",
  "Ashen Waltz",
  "Heir of the Sable Star",
  "Embers of Eden",
  "Eclipsed Vows",
  "Hollow Vantage",
  "Relics of Lucent Night",
  "Midnight Museum",
  "Echoes of the Red Garden",
  "Ivory Labyrinth",
  "Apostle Drift",
  "Fallen Sonata",
  "Warden of Glass",
  "Noctis Archive",
  "Afterlight Covenant",
  "Ravencrest Summer",
  "Scarlet Interval"
];

const extraGames = extraTitles.map((title, index) => {
  const mature = index % 3 === 0;
  const rating = 8.1 + (index % 7) * 0.17;
  const engines = [...ENGINES];
  return {
    title,
    tagline: `${title} delivers premium dark-fantasy drama with polished route writing and striking UI.`,
    developer: ["Ebon Vale", "Studio Cathedra", "Moonglass", "Ivory Engine"][index % 4],
    engine: engines[index % engines.length],
    releaseDate: `2025-${String((index % 9) + 1).padStart(2, "0")}-${String((index % 20) + 3).padStart(2, "0")}`,
    updatedAt: `2026-05-${String((index % 20) + 1).padStart(2, "0")}`,
    rating,
    reviewCount: 280 + index * 41,
    popularityScore: 38000 + index * 2140,
    bookmarks: 1600 + index * 98,
    downloads: 12000 + index * 760,
    mature,
    featured: index % 6 === 0,
    hero: false,
    genres: [
      index % 2 === 0 ? "Visual Novel" : "Sandbox",
      index % 3 === 0 ? "RPG" : "Story Rich",
      index % 4 === 0 ? "Choice Matter" : "Anime Games"
    ],
    tags: [
      mature ? "18+" : "Fantasy",
      index % 2 === 0 ? "Romance" : "Mystery",
      index % 3 === 0 ? "Open World" : "Companion Routes"
    ],
    platforms: index % 2 === 0 ? ["Windows", "macOS"] : ["Windows", "Android"],
    languages: ["English"],
    story: `${title} follows a protagonist trapped between devotion, ambition, and a beautiful city that hides knives behind stained glass.`,
    shortDescription: `${title} mixes premium anime presentation, route-based storytelling, and collectible lore.`,
    description: `${title} is designed like a fully featured premium release, with layered decisions, sharp cast chemistry, and polished progression loops for players who love gothic mood.`,
    trailerUrl: "https://www.youtube.com/watch?v=oHg5SJYRHA0"
  };
});

export const demoGames: Game[] = [...roster, ...extraGames].map((game, index) => {
  const slug = slugify(game.title);
  return {
    id: `game-${index + 1}`,
    slug,
    title: game.title,
    tagline: game.tagline,
    shortDescription: game.shortDescription,
    description: game.description,
    story: game.story,
    version: `v${1 + Math.floor(index / 10)}.${(index % 10) + 1}.${index % 5}`,
    developer: game.developer,
    engine: game.engine,
    releaseDate: game.releaseDate,
    updatedAt: game.updatedAt,
    rating: game.rating,
    reviewCount: game.reviewCount,
    popularityScore: game.popularityScore,
    bookmarks: game.bookmarks,
    downloads: game.downloads,
    mature: game.mature,
    featured: game.featured,
    hero: game.hero,
    coverImage: coverPool[index % coverPool.length],
    bannerImage: "/backgrounds/eden-cathedral.png",
    gallery: [
      screenshotPool[index % screenshotPool.length],
      screenshotPool[(index + 1) % screenshotPool.length],
      screenshotPool[(index + 2) % screenshotPool.length]
    ],
    trailerUrl: game.trailerUrl,
    genres: game.genres,
    tags: game.tags,
    platforms: game.platforms,
    languages: game.languages
  };
});

export const demoUsers: UserProfile[] = [...userSeed];

export const demoNewsPosts: Post[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `post-${index + 1}`,
  slug: `edenverse-weekly-${index + 1}`,
  title: [
    "EdenVerse Weekly: The Premium Sandbox Wave",
    "How Adult Safe Mode Curates Without Killing Mood",
    "Visual Novel Renaissance: 6 New Gothic Releases",
    "Behind the UI: Building a Launcher-Like Discover Page",
    "Choice Matter Games Are Having a Dark Fantasy Moment",
    "Hidden Gems: Five Routes You Should Not Skip",
    "Patch Radar: What Updated This Week",
    "Inside the Admin CMS: Editorial Workflow for Premium Hubs",
    "Community Spotlight: Reviews Worth Reading",
    "Why Cathedral Visuals Keep Winning the Mood War"
  ][index],
  excerpt:
    "Editorial coverage crafted for a premium VN discovery platform, mixing updates, curation, and polished release notes.",
  content: `
# ${[
    "Curated discovery, but cinematic.",
    "The goal of safe mode is trust, not censorship.",
    "Dark fantasy VNs are shipping with serious confidence.",
    "A premium website needs interface rhythm, not noise.",
    "Players want consequences they can feel.",
    "These hidden gems punch far above their budget.",
    "Version notes matter when the audience tracks route changes.",
    "Editors need speed without sacrificing metadata quality.",
    "The community elevates the whole platform.",
    "A great background can become a full product identity."
  ][index]}

EdenVerse is designed to feel less like a blog and more like a curated launcher. This article explores how premium discovery, adult-safe presentation, editorial discipline, and community taste can live inside the same dark-fantasy shell.

## What Changed

- New curated sections now emphasize mood-first discovery.
- Review modules prioritize route quality and consequence density.
- Admin publishing keeps SEO, thumbnails, and scheduling in one surface.

## Why It Matters

Readers are not just browsing titles. They are browsing *vibes*, trust, route quality, update cadence, and the promise of a premium experience. Every release note, banner, and content card should reflect that.
  `.trim(),
  coverImage: coverPool[index % coverPool.length],
  category: index % 2 === 0 ? "Updates" : "Editorial",
  tags: index % 2 === 0 ? ["Patch Notes", "Curation", "Premium"] : ["Opinion", "UI", "Visual Novel"],
  seoTitle: `EdenVerse Insight ${index + 1} | Premium VN Curation`,
  seoDescription:
    "Editorial insight into premium visual novel discovery, dark fantasy web design, and curated adult-safe game coverage.",
  author: index % 3 === 0 ? "Eden Archivist" : index % 2 === 0 ? "Riven Hart" : "Lyra Vael",
  createdAt: `2026-05-${String(index + 1).padStart(2, "0")}`,
  publishedAt: `2026-05-${String(index + 2).padStart(2, "0")}T10:00:00Z`,
  status: "PUBLISHED"
}));

const makeSummary = (userId: string): UserSummary => {
  const user = userLookup.get(userId);
  if (!user) {
    throw new Error(`Unknown user ${userId}`);
  }

  const { id, name, username, avatar, role, level, reputation } = user;
  return { id, name, username, avatar, role, level, reputation };
};

export const demoComments: Comment[] = [
  {
    id: "comment-1",
    gameSlug: "seraph-code",
    body: "The district routing in chapter three is wild. I love how your companion banter changes based on the halo heat meter.",
    createdAt: "2026-05-18T07:20:00Z",
    likes: 92,
    reports: 0,
    author: makeSummary("user-sol"),
    replies: [
      {
        id: "comment-1a",
        parentId: "comment-1",
        gameSlug: "seraph-code",
        body: "Same. It feels premium in a way most sandbox VNs miss.",
        createdAt: "2026-05-18T09:02:00Z",
        likes: 24,
        reports: 0,
        author: makeSummary("user-lyra")
      }
    ]
  },
  {
    id: "comment-2",
    gameSlug: "eternum-reverie",
    body: "The political route with House Mirren is the closest thing to Once in a Lifetime energy I've played this year.",
    createdAt: "2026-05-16T14:15:00Z",
    likes: 134,
    reports: 1,
    author: makeSummary("user-aria")
  },
  {
    id: "comment-3",
    gameSlug: "crown-of-ashes",
    body: "I appreciate that EdenVerse surfaces the exact engine, version, and route complexity right in the hero panel.",
    createdAt: "2026-05-20T11:00:00Z",
    likes: 67,
    reports: 0,
    author: makeSummary("user-riven")
  },
  {
    id: "comment-4",
    postSlug: "edenverse-weekly-1",
    body: "This editorial format is strong. Clean UI, but still moody.",
    createdAt: "2026-05-12T12:00:00Z",
    likes: 16,
    reports: 0,
    author: makeSummary("user-lyra")
  }
];

export const demoReviews: Review[] = [
  {
    id: "review-1",
    gameSlug: "eternum-reverie",
    rating: 10,
    title: "Luxurious route writing",
    body: "This feels like a premium release in every sense: UI, soundtrack, relationship pacing, and consequence design. It never wastes a scene.",
    helpful: 422,
    createdAt: "2026-05-11T12:00:00Z",
    author: makeSummary("user-aria")
  },
  {
    id: "review-2",
    gameSlug: "seraph-code",
    rating: 9,
    title: "A sandbox with real momentum",
    body: "The city is dense, adult content is integrated instead of cheap, and every district gives you meaningful route variation. Excellent update cadence too.",
    helpful: 318,
    createdAt: "2026-05-14T17:40:00Z",
    author: makeSummary("user-sol")
  },
  {
    id: "review-3",
    gameSlug: "cathedral-zero",
    rating: 9,
    title: "For mystery players first",
    body: "A gorgeous time-loop mystery that trusts the player. The pacing is slow on purpose, and the atmosphere carries every reveal beautifully.",
    helpful: 162,
    createdAt: "2026-05-07T09:15:00Z",
    author: makeSummary("user-riven")
  }
];
