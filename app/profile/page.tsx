import Link from "next/link";
import type { Metadata } from "next";
import { Crown, ShieldCheck, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllUsers } from "@/services/user-service";

/* eslint-disable @next/next/no-img-element */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hồ sơ cộng đồng",
  description: "Danh sách hồ sơ thành viên EdenVerse."
};

export default async function ProfilesPage() {
  const users = await getAllUsers();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Cộng đồng"
        title="Hồ sơ mọi thành viên EdenVerse"
        description="Mỗi tài khoản có hồ sơ công khai với cấp độ, danh tiếng, bio, game đã lưu và danh sách theo dõi."
      />

      {users.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <Link key={user.id} href={`/profile/${user.username}`} className="group block">
              <Card className="h-full overflow-hidden transition group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:bg-white/8">
                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${user.banner})` }}>
                  <div className="h-full bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-4">
                    <img
                      alt={user.name}
                      className="h-16 w-16 rounded-full border border-white/12 bg-black/40 object-cover"
                      src={user.avatar}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate font-display text-3xl text-foreground">{user.name}</h2>
                        {user.role === "SUPER_ADMIN" ? <Crown className="h-4 w-4 text-accent" /> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{user.bio}</p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <ProfileMiniStat label="Level" value={String(user.level)} />
                    <ProfileMiniStat label="Danh tiếng" value={String(user.reputation)} />
                    <ProfileMiniStat label="Đã lưu" value={String(user.savedGames.length)} />
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Xem hồ sơ
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <UsersRound className="h-10 w-10 text-primary" />
            <h2 className="font-display text-4xl text-foreground">Chưa có hồ sơ nào</h2>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Khi người dùng đăng ký hoặc admin được tạo trong database, hồ sơ công khai sẽ xuất hiện tại đây.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function ProfileMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/20 p-3">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl text-foreground">{value}</p>
    </div>
  );
}
