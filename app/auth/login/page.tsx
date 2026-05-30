"use client";

import Link from "next/link";
import type { Route } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getSafeCallbackUrl() {
  const params = new URLSearchParams(window.location.search);
  const callbackUrl = params.get("callbackUrl") ?? "/admin";

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/admin";
  }

  return callbackUrl;
}

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const role = session?.user?.role ?? "USER";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      router.replace(getSafeCallbackUrl() as Route);
    }
  }, [isAdmin, router, status]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Nhập email và mật khẩu trước đã nhé.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("Đang kiểm tra tài khoản...");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        rememberMe,
        redirect: false
      });

      if (result?.error) {
        setSuccess("");
        setError("Email hoặc mật khẩu chưa đúng.");
        return;
      }

      const latestSession = await getSession();
      const latestRole = latestSession?.user?.role ?? "USER";
      const username = latestSession?.user?.username;

      if (latestRole === "ADMIN" || latestRole === "SUPER_ADMIN") {
        setSuccess("Đăng nhập admin thành công, đang chuyển vào khu quản trị...");
        router.push(getSafeCallbackUrl() as Route);
      } else {
        setSuccess("Đăng nhập thành công. Tài khoản này chưa có quyền quản trị nên mình đưa bạn về hồ sơ.");
        router.push((username ? `/profile/${username}` : "/profile") as Route);
      }
      router.refresh();
    } catch {
      setSuccess("");
      setError("Không thể đăng nhập lúc này, thử tải lại trang rồi đăng nhập lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && isAdmin)) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng nhập</p>
            <h1 className="font-display text-4xl text-foreground">Đang kiểm tra phiên đăng nhập...</h1>
            <p className="text-sm leading-7 text-muted-foreground">Nếu tài khoản có quyền admin, hệ thống sẽ tự chuyển vào khu quản trị.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (status === "authenticated") {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-6 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-primary">Đã đăng nhập</p>
              <h1 className="mt-2 font-display text-5xl text-foreground">Bạn đang dùng tài khoản thường</h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Tài khoản <span className="font-semibold text-foreground">{session.user?.email}</span> đang có role{" "}
                <span className="font-semibold text-primary">{role}</span>, nên chưa thể vào khu đăng game/admin.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Muốn đăng game thì cần đăng nhập bằng tài khoản có role <span className="text-foreground">ADMIN</span> hoặc{" "}
                <span className="text-foreground">SUPER_ADMIN</span>.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href={(session.user?.username ? `/profile/${session.user.username}` : "/profile") as Route}>
                <Button type="button" variant="secondary" className="w-full">
                  Về hồ sơ
                </Button>
              </Link>
              <Button type="button" className="w-full" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
                Đăng xuất để đổi tài khoản
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng nhập</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Chào mừng trở lại</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Đăng nhập một lần để vào khu quản trị. Phiên đăng nhập được giữ lâu hơn để bạn không phải nhập lại liên tục.
            </p>
          </div>

          <form onSubmit={submitLogin} className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email quản trị" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Mật khẩu" />
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-black/40"
              />
              Giữ đăng nhập trên thiết bị này
            </label>
            {success ? <p className="rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">{success}</p> : null}
            {error ? <p className="rounded-lg border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? "Đang kiểm tra..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/register" className="hover:text-foreground">
              Tạo tài khoản
            </Link>
            <Link href="/auth/forgot-password" className="hover:text-foreground">
              Quên mật khẩu
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
