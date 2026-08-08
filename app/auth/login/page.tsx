"use client";

import Link from "next/link";
import type { Route } from "next";
import { getSession, signIn, useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getSafeCallbackUrl() {
  const params = new URLSearchParams(window.location.search);
  const callbackUrl = params.get("callbackUrl") ?? "/profile";

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/profile";
  }

  if (callbackUrl.startsWith("/eden-vault")) {
    return "/profile";
  }

  return callbackUrl;
}

function getProfileUrl(username?: string | null) {
  return (username ? `/profile/${username}` : "/profile") as Route;
}

function isAdminRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
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

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const destination = isAdminRole(session?.user?.role) ? "/admin" : getProfileUrl(session?.user?.username);
    router.replace(destination as Route);
  }, [router, session?.user?.role, session?.user?.username, status]);

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
      const username = latestSession?.user?.username;
      const isAdmin = isAdminRole(latestSession?.user?.role);
      const callbackUrl = getSafeCallbackUrl();
      const destination = isAdmin ? "/admin" : callbackUrl === "/profile" ? getProfileUrl(username) : callbackUrl;

      setSuccess(isAdmin ? "Đăng nhập admin thành công, đang mở khu quản trị..." : "Đăng nhập thành công, đang mở hồ sơ của bạn...");
      router.push(destination as Route);
      router.refresh();
    } catch {
      setSuccess("");
      setError("Không thể đăng nhập lúc này, thử tải lại trang rồi đăng nhập lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng nhập</p>
            <h1 className="font-display text-4xl text-foreground">Đang kiểm tra phiên đăng nhập...</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              Nếu là admin, hệ thống sẽ đưa bạn vào khu quản trị. Nếu là người dùng, hệ thống sẽ mở hồ sơ cá nhân.
            </p>
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
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Tài khoản</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Chào mừng trở lại</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Đăng nhập để lưu game yêu thích, chỉnh hồ sơ và theo dõi các bản cập nhật mới nhất trên EdenVerse. Nếu tài khoản của bạn có quyền
              admin, hệ thống sẽ tự mở khu quản trị.
            </p>
          </div>

          <form onSubmit={submitLogin} className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
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

          <p className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-xs leading-6 text-muted-foreground">
            Tài khoản quản trị được bảo vệ bằng mật khẩu riêng rất mạnh và quyền trong database. Không cần nhập mã cổng ở trang này nữa.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
