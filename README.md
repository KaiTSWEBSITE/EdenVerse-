# EdenVerse

EdenVerse l? website gi?i thi?u v? qu?n l? game theo phong c?ch dark fantasy, gothic v? visual novel premium. Trang ch? t?p trung v?o 3 k? ch?nh: Game Hot theo l??t click t?i, game m?i ra m?t v? game ch?t l??ng t?t.

![EdenVerse Preview](./public/backgrounds/eden-cathedral.png)

## ?i?m Ch?nh

- Next.js 15 App Router, React 19, TypeScript, TailwindCSS v? Framer Motion.
- Prisma + PostgreSQL v?i migration production t? ch?y tr?n Vercel.
- NextAuth credentials login b?ng email/password, kh?ng d?ng Google/Discord.
- Kh?ng hard-code t?i kho?n admin production trong source ho?c README.
- Super Admin ???c t?o b?ng `ADMIN_SETUP_TOKEN` b? m?t m?t l?n.
- T?i kho?n admin b? ch?n kh?i form login c?ng khai; ph?i ?i qua c?ng ri?ng `/eden-vault` v?i `ADMIN_ACCESS_KEY`.
- Admin c? form ??ng game th?t v?o PostgreSQL, ch?nh gi?i thi?u trang ch?, x?a b?i, x?a game demo v? ??i m?t kh?u.
- M?i game h? tr? link t?i ch?nh v? link t?i ph?/mirror d? ph?ng.
- Header v? footer c? n?t Discord server, c?u h?nh b?ng `NEXT_PUBLIC_DISCORD_URL`.
- Logo SVG t?nh t?i `public/logos/edenverse-mark.svg`, g?n nh? v? d? thay ??i.
- C? rate limit, role check, origin check, bcrypt hash, Zod validation, upload filter v? security headers.

## Ch?y Local

```bash
npm install
npm run dev
```

M? [http://localhost:3000](http://localhost:3000).

## Bi?n M?i Tr??ng

Copy file env:

```bash
copy .env.example .env
```

Bi?n quan tr?ng:

- `DATABASE_URL`: PostgreSQL production ho?c local.
- `DATABASE_URL_UNPOOLED`: URL direct/unpooled cho migration tr?n Vercel n?u c?.
- `AUTH_SECRET`: chu?i b? m?t m?nh cho NextAuth.
- `ADMIN_SETUP_TOKEN`: token b? m?t ch? d?ng ?? bootstrap Super Admin l?n ??u.
- `ADMIN_ACCESS_KEY`: m? c?ng ri?ng ?? cho ph?p t?i kho?n admin ??ng nh?p qua `/eden-vault`.
- `ENABLE_DEMO_AUTH`: ch? b?t `true` cho local demo, kh?ng b?t production.
- `ENABLE_PRISMA_DEMO_FALLBACK`: b?t/t?t game fallback demo.
- `NEXT_PUBLIC_SITE_INTRO`: c?u gi?i thi?u m?c ??nh tr??c khi admin l?u setting.
- `NEXT_PUBLIC_DISCORD_URL`: link invite Discord server hi?n th? ? menu v? footer.

## PostgreSQL / Prisma

```bash
docker-compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
```

Tr?n Vercel, `npm run build` s? t? ch?y `prisma generate` v? `prisma migrate deploy` khi c? `VERCEL=1` v? `DATABASE_URL`.

## Admin Production

Kh?ng c? m?t kh?u admin m?c ??nh. Quy tr?nh ??ng l?:

1. T?o `ADMIN_SETUP_TOKEN` m?nh trong Vercel.
2. Deploy.
3. G?i `POST /api/admin/bootstrap` v?i token b? m?t ?? t?o Super Admin.
4. G? `ADMIN_SETUP_TOKEN` v? redeploy ?? kh?a bootstrap.
5. T?o `ADMIN_ACCESS_KEY` m?nh trong Vercel v? ch? ch? s? h?u bi?t m? n?y.
6. ??ng nh?p b?ng t?i kho?n Super Admin th?t t?i `/eden-vault`, sau ?? ??i m?t kh?u trong `/admin`.

## Routes Ch?nh

- `/`: trang ch? v?i 3 k? game ch?nh.
- `/games/hot`: Game Hot theo l??t click t?i.
- `/games/new`: game m?i ra m?t.
- `/games/quality`: game ch?t l??ng t?t.
- `/games/[slug]`: chi ti?t game.
- `/search`: t?m ki?m v? l?c game.
- `/admin`: qu?n tr? game, n?i dung, b?o m?t v? SEO.
- `/auth/login`: ??ng nh?p ng??i d?ng th??ng b?ng email/password.
- `/eden-vault`: c?ng ri?ng cho ch? s? h?u/admin, y?u c?u th?m `ADMIN_ACCESS_KEY`.

## API Ch?nh

- `GET /api/games`
- `POST /api/games/[slug]/download`: body c? th? g?i `{ "mirror": "primary" }` ho?c `{ "mirror": "backup" }`.
- `POST /api/admin/bootstrap`
- `POST /api/admin/games`
- `POST /api/admin/password`
- `POST /api/admin/settings`
- `GET|DELETE /api/admin/posts`
- `POST /api/upload`

## Background

?nh n?n ch?nh n?m t?i `public/backgrounds/eden-cathedral.png` v? ???c d?ng xuy?n su?t website v?i blur nh?, overlay t?i, vignette, ?nh xanh k?nh cathedral, fog v? particles nh?.
