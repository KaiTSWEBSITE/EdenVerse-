# EdenVerse

EdenVerse là website giới thiệu và đánh giá game theo phong cách dark fantasy, gothic và visual novel premium. Trang chủ chỉ tập trung vào 3 kệ chính: Game Hot theo lượt click tải, game mới ra mắt và game chất lượng tốt.

![EdenVerse Preview](./public/backgrounds/eden-cathedral.png)

## Điểm Chính

- Next.js 15 App Router, React 19, TypeScript, TailwindCSS và Framer Motion.
- UI glassmorphism nhẹ, nền cathedral cinematic, fog/particles/parallax vừa đủ để mượt.
- Prisma + PostgreSQL, migration, seed data và fallback demo để chạy ngay sau khi clone.
- NextAuth credentials login bằng email/password, đã bỏ Google/Discord theo yêu cầu.
- CAPTCHA bảo vệ đăng nhập, đăng ký, quên mật khẩu, bình luận, review và admin actions.
- Admin có form đăng game và phần tự chỉnh câu giới thiệu trang chủ.
- Bảo mật gồm CSP, security headers, origin check chống CSRF, rate limit, bcrypt, Zod validation và upload filter.
- Tắt `X-Powered-By`, không xuất production source maps, chặn các đường dẫn nhạy cảm như `.env`, `.git`, `package.json`, `prisma`, `node_modules`.

## Chạy Nhanh

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). App chạy được ngay bằng demo fallback nếu chưa cấu hình PostgreSQL.

## Tài Khoản Demo

- Admin: `admin@edenverse.gg` / `Admin@123`
- Member: `aria@edenverse.gg` / `Demo@123`

## Cấu Hình Môi Trường

Copy file env:

```bash
copy .env.example .env
```

Các biến quan trọng:

- `DATABASE_URL`: PostgreSQL thật cho production.
- `AUTH_SECRET`: chuỗi bí mật mạnh cho NextAuth.
- `NEXT_PUBLIC_SITE_INTRO`: câu giới thiệu mặc định trước khi admin lưu setting.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` và `TURNSTILE_SECRET_KEY`: bật Cloudflare Turnstile CAPTCHA.
- `CAPTCHA_SECRET`: khóa ký CAPTCHA nội bộ nếu chưa dùng Turnstile.

Nếu chưa có Turnstile key, EdenVerse dùng CAPTCHA nội bộ dạng phép tính được ký bằng server secret để vẫn test được local.

## PostgreSQL / Prisma

```bash
docker-compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
```

Muốn tắt fallback demo:

```bash
ENABLE_PRISMA_DEMO_FALLBACK="false"
```

## Routes Chính

- `/`: trang chủ với 3 kệ game chính.
- `/games/hot`: Game Hot, xếp hạng theo lượt click tải.
- `/games/new`: game mới ra mắt.
- `/games/quality`: game chất lượng tốt.
- `/games/[slug]`: chi tiết game.
- `/search`: tìm kiếm và lọc game.
- `/profile/[username]`: hồ sơ người dùng.
- `/dashboard`: dashboard thành viên.
- `/admin`: quản trị, đăng game, chỉnh giới thiệu, bảo mật và SEO.
- `/auth/login`, `/auth/register`, `/auth/forgot-password`: xác thực email/password có CAPTCHA.

## API Chính

- `GET /api/security/captcha`
- `GET /api/games`
- `GET /api/games/[slug]`
- `POST /api/games/[slug]/download`
- `GET /api/games/search`
- `POST /api/admin/games`
- `POST /api/admin/settings`
- `GET /api/search`
- `GET|POST /api/comments`
- `GET|POST /api/reviews`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/upload`

## Cấu Trúc

```text
project-root/
├── app/
├── components/
├── config/
├── constants/
├── context/
├── database/
├── hooks/
├── lib/
├── middleware/
├── prisma/
├── public/
├── scripts/
├── services/
├── styles/
├── types/
├── utils/
├── .env.example
├── package.json
└── README.md
```

## Production Checklist

1. Thêm `DATABASE_URL` production.
2. Đặt `AUTH_SECRET` và `CAPTCHA_SECRET` mạnh.
3. Cấu hình `NEXTAUTH_URL` và `AUTH_TRUST_HOST`.
4. Thêm Turnstile keys nếu muốn CAPTCHA provider thật.
5. Chuyển upload local sang S3, Cloudflare R2 hoặc Supabase Storage.
6. Chạy migration và seed.
7. Tắt fallback demo nếu muốn dữ liệu hoàn toàn từ DB.

## Background

Ảnh nền chính nằm tại `public/backgrounds/eden-cathedral.png` và được dùng xuyên suốt website với blur nhẹ, overlay tối, vignette, ánh xanh kính cathedral, fog và particles rất nhẹ.
