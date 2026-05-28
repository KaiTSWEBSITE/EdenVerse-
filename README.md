# EdenVerse

EdenVerse is a premium dark-fantasy discovery platform for visual novels, sandbox titles, RPGs, anime games, choice-matter stories, and optional 18+ content curation. It is built as a real Next.js application with App Router, TypeScript, TailwindCSS, Framer Motion, Prisma, demo APIs, seed data, CMS/admin surfaces, and a full premium UI using the supplied cathedral background image.

![EdenVerse Preview](./public/backgrounds/eden-cathedral.png)

## Highlights

- Next.js 15 App Router with TypeScript
- TailwindCSS + shadcn-inspired UI component system
- Framer Motion backdrop, parallax, reveal, glow, fog, and cinematic layering
- Prisma schema for PostgreSQL with migration + seed script
- NextAuth credentials flow with ready hooks for Google and Discord
- Demo-safe runtime fallback so `npm install` and `npm run dev` work even before PostgreSQL is configured
- Search system with suggestions, filters, and ranked results
- Game detail pages with gallery, reviews, comments, metadata, and related recommendations
- Profile, dashboard, and admin game-publishing surfaces
- 30 demo games, 5 demo users, seeded comments and reviews
- Rate-limit helpers, secure headers, upload API, sitemap, and robots setup

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, TailwindCSS, Framer Motion
- UI: shadcn-style component patterns with Radix primitives
- Auth: NextAuth
- Database: PostgreSQL + Prisma ORM
- State: Zustand
- Validation: Zod
- Security helpers: bcryptjs, CSP headers, rate limiting, sanitization

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

The app runs immediately in demo fallback mode, even if you do not configure PostgreSQL yet.

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

- Admin
  - Email: `admin@edenverse.gg`
  - Password: `Admin@123`
- Member
  - Email: `aria@edenverse.gg`
  - Password: `Demo@123`

## Optional PostgreSQL Setup

If you want real Prisma-backed persistence instead of demo fallback:

1. Copy the env template:

```bash
copy .env.example .env
```

2. Start PostgreSQL, either with your own server or Docker:

```bash
docker-compose up -d postgres
```

3. Run Prisma generate + migrate + seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Set `ENABLE_PRISMA_DEMO_FALLBACK="false"` in `.env` if you want the app to stop using local demo fallback.

## Project Structure

```text
project-root/
├── app/                  # App Router pages, route handlers, SEO files
├── components/           # UI, layout, game, profile, admin, search modules
├── hooks/                # Client hooks
├── context/              # Zustand-powered providers and app store
├── services/             # Data access / business logic layer
├── lib/                  # Utilities, markdown renderer, validators
├── prisma/               # Prisma schema + migration
├── middleware/           # Security headers and rate-limit utilities
├── public/               # Background image, covers, avatars, screenshots, logos
├── admin/                # Admin metadata barrel
├── auth/                 # Auth metadata barrel
├── profile/              # Profile metadata barrel
├── dashboard/            # Dashboard metadata barrel
├── api/                  # API namespace barrel
├── styles/               # Theme and prose styling
├── config/               # Site, auth, navigation config
├── types/                # Shared application types
├── constants/            # Roles, filters, tags
├── utils/                # Security + formatting helpers
├── database/             # Demo dataset + Prisma client wrapper
├── scripts/              # Seed logic
└── README.md
```

## Main Routes

- `/` home landing with curated sections
- `/games/hot` hot games ranked by download clicks
- `/games/new` newly released games
- `/games/quality` high-quality games
- `/search` smart search + filter sidebar
- `/games/[slug]` detailed game page
- `/profile/[username]` user profile
- `/dashboard` member dashboard
- `/admin` admin game publishing / analytics panel
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`

## API Routes

- `GET /api/games`
- `GET /api/games/[slug]`
- `POST /api/games/[slug]/download`
- `GET /api/games/search`
- `POST /api/admin/games`
- `GET /api/search`
- `GET|POST /api/comments`
- `PATCH /api/comments/[id]`
- `GET|POST /api/reviews`
- `PATCH /api/reviews/[id]`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify`
- `GET /api/auth/session`
- `POST /api/upload`
- `GET /api/analytics`
- `GET /api/users`
- `GET /api/profile`

## Security Notes

- CSP, referrer, and browser security headers are applied in middleware
- Rate limiting is included for comments, reviews, and login attempts
- Password hashing uses `bcryptjs`
- Input payloads are validated with Zod
- Markdown/HTML rendering is sanitized before output
- Admin/API requests use role checks, rate limits, CSP, and validated upload payloads

## Production Notes

- The included upload route saves files locally to `public/uploads` for easy development. For production, wire that route to S3, Cloudflare R2, Supabase Storage, or your preferred object store.
- Google and Discord login use real NextAuth OAuth providers. Add provider credentials in `.env` or Vercel environment variables, then use callbacks `/api/auth/callback/google` and `/api/auth/callback/discord`.
- The app deliberately ships with local demo data fallback so development is smooth from the first clone.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Deployment Checklist

1. Add production `DATABASE_URL`
2. Set a strong `AUTH_SECRET`
3. Configure `NEXTAUTH_URL` and `AUTH_TRUST_HOST`
4. Provide Google/Discord OAuth credentials
5. Replace local upload storage with cloud storage
6. Disable demo fallback with `ENABLE_PRISMA_DEMO_FALLBACK="false"`

## Notes About the Included Background

The main site backdrop uses the user-provided cathedral image from `public/backgrounds/eden-cathedral.png`, layered with blur, dark gradient overlays, vignette, parallax movement, glass glow, subtle particles, and light ray effects to keep the entire UI inside the requested dark fantasy premium mood.
