"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthProviderMap = Record<string, { id: string; name: string; type: string }>;

export default function LoginPage() {
  const [email, setEmail] = useState("admin@edenverse.gg");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<AuthProviderMap>({});
  const router = useRouter();
  const googleReady = Boolean(providers.google);
  const discordReady = Boolean(providers.discord);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/providers")
      .then((response) => response.json())
      .then((data: AuthProviderMap) => {
        if (!cancelled) {
          setProviders(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProviders({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng nhập</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Chào mừng trở lại</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Email/password dùng được ngay. Google và Discord được nối qua NextAuth OAuth thật khi bạn cấu hình credentials trên Vercel.
            </p>
          </div>
          <div className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button
              className="w-full"
              onClick={async () => {
                const result = await signIn("credentials", {
                  email,
                  password,
                  redirect: false
                });

                if (result?.error) {
                  setError("Email hoặc mật khẩu không đúng.");
                  return;
                }

                router.push("/dashboard");
              }}
            >
              Đăng nhập
            </Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                disabled={!googleReady}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                title={googleReady ? "Đăng nhập bằng Google" : "Cần GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET"}
              >
                Kết nối Google
              </Button>
              <Button
                variant="secondary"
                disabled={!discordReady}
                onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                title={discordReady ? "Đăng nhập bằng Discord" : "Cần DISCORD_CLIENT_ID và DISCORD_CLIENT_SECRET"}
              >
                Kết nối Discord
              </Button>
            </div>
            {!googleReady || !discordReady ? (
              <p className="text-xs leading-6 text-muted-foreground">
                OAuth sẽ bật tự động khi thêm secret thật trong Vercel: Google callback `/api/auth/callback/google`, Discord callback
                `/api/auth/callback/discord`.
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/register" className="hover:text-foreground">Tạo tài khoản</Link>
            <Link href="/auth/forgot-password" className="hover:text-foreground">Quên mật khẩu</Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
