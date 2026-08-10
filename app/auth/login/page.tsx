"use client";

import Link from "next/link";
import type { Route } from "next";
import { getSession, signIn, useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

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
      setError("Vui lòng điền đủ email và mật khẩu.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("Đang xác thực...");

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

      setSuccess(isAdmin ? "Đang mở khu quản trị..." : "Đăng nhập thành công!");
      router.push(destination as Route);
      router.refresh();
    } catch {
      setSuccess("");
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden mt-[-76px] py-20 px-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/auth-bg.jpg" // We will use a generic placeholder or an atmospheric background
          alt="EdenVerse Background"
          fill
          className="object-cover opacity-30 object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 sm:p-10 rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl bg-black/40">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Eden<span className="text-primary">Verse</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Đăng nhập để lưu game và tham gia cộng đồng
            </p>
          </div>

          <form onSubmit={submitLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center text-sm text-primary">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary px-4 rounded-xl text-white placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Mật khẩu</label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80 transition">
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary px-4 rounded-xl text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 focus:ring-offset-0 cursor-pointer w-4 h-4"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-[0_0_20px_rgba(87,188,255,0.3)] transition-all mt-4"
            >
              {submitting ? "Đang xử lý..." : "Đăng nhập ngay"}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/auth/register" className="font-semibold text-white hover:text-primary transition underline underline-offset-4">
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
