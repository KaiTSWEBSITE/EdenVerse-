"use client";

import type { Route } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LockKeyhole, ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

function getSafeAdminCallbackUrl() {
  const params = new URLSearchParams(window.location.search);
  const callbackUrl = params.get("callbackUrl") ?? "/admin";

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/admin";
  }

  return callbackUrl.startsWith("/admin") ? callbackUrl : "/admin";
}

export default function EdenVaultPage() {
  const { data: session, status } = useSession();
  const [accessKey, setAccessKey] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const role = session?.user?.role ?? "USER";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const hasVaultAccess = isAdmin && session?.user?.adminVaultPassed === true;

  useEffect(() => {
    if (status === "authenticated" && hasVaultAccess) {
      router.replace(getSafeAdminCallbackUrl() as Route);
    }
  }, [hasVaultAccess, router, status]);

  async function submitVaultLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessKey.trim() || !email.trim() || !password) {
      setError("Nhập đủ mã cổng, email và mật khẩu quản trị.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("Đang kiểm tra cổng quản trị...");

    try {
      const result = await signIn("credentials", {
        adminAccessKey: accessKey.trim(),
        adminMode: "true",
        email: email.trim(),
        password,
        redirect: false
      });

      if (result?.error) {
        setSuccess("");
        setError("Không mở được cổng quản trị. Kiểm tra lại mã cổng hoặc tài khoản.");
        return;
      }

      const latestSession = await getSession();
      const latestRole = latestSession?.user?.role ?? "USER";
      const latestVaultAccess = latestSession?.user?.adminVaultPassed === true;

      if ((latestRole !== "ADMIN" && latestRole !== "SUPER_ADMIN") || !latestVaultAccess) {
        await signOut({ redirect: false });
        setSuccess("");
        setError("Tài khoản này không có quyền quản trị.");
        return;
      }

      setSuccess("Cổng quản trị đã mở, đang chuyển vào bảng điều khiển...");
      router.push(getSafeAdminCallbackUrl() as Route);
      router.refresh();
    } catch {
      setSuccess("");
      setError("Không thể mở cổng quản trị lúc này, thử tải lại trang rồi đăng nhập lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && hasVaultAccess)) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[-76px] py-20 px-4">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/backgrounds/eden-cathedral.png"
            alt="EdenVault Background"
            fill
            className="object-cover opacity-30 object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="glass-panel p-8 sm:p-10 rounded-[28px] border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-[#050510]/60 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/20 text-primary shadow-[0_0_30px_rgba(87,188,255,0.3)] animate-pulse">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary mb-2">Eden Vault</p>
              <h1 className="font-display text-3xl font-bold text-white">Đang xác thực...</h1>
            </div>
            <p className="text-sm text-muted-foreground">Nếu phiên hợp lệ, hệ thống sẽ tự chuyển vào bảng điều khiển.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[-76px] py-20 px-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/eden-cathedral.png"
          alt="EdenVault Background"
          fill
          className="object-cover opacity-40 object-center grayscale mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        {/* Red tinted glow for Admin */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-3/4 rounded-full bg-red-900/10 blur-[150px] mix-blend-screen opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 sm:p-10 rounded-[28px] border border-red-500/20 shadow-[0_8px_40px_rgba(220,38,38,0.15)] backdrop-blur-2xl bg-[#050510]/70">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_34px_rgba(220,38,38,0.2)] mb-6">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-red-400 font-semibold drop-shadow-md">Khu vực hạn chế</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-white">Eden Vault</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Cổng xác thực hai lớp dành riêng cho quản trị viên.
            </p>
          </div>

          <form onSubmit={submitVaultLogin} className="space-y-5">
            {success && (
              <div className="rounded-xl p-3 text-center text-sm border bg-primary/10 border-primary/20 text-primary">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-xl p-3 text-center text-sm border bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-2 text-left">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Mã cổng (Access Key)</label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                  <Input
                    value={accessKey}
                    onChange={(event) => setAccessKey(event.target.value)}
                    type="password"
                    placeholder="Nhập mã cổng bí mật..."
                    className="h-12 pl-11 bg-white/5 border-white/10 focus-visible:ring-red-500 focus-visible:border-red-500 rounded-xl text-white placeholder:text-muted-foreground/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Email quản trị</label>
                <Input 
                  value={email} 
                  onChange={(event) => setEmail(event.target.value)} 
                  placeholder="admin@example.com" 
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-red-500 focus-visible:border-red-500 px-4 rounded-xl text-white placeholder:text-muted-foreground/50"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Mật khẩu</label>
                <Input 
                  value={password} 
                  onChange={(event) => setPassword(event.target.value)} 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-red-500 focus-visible:border-red-500 px-4 rounded-xl text-white placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <Button 
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-base shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all mt-4" 
              disabled={submitting} 
              type="submit"
            >
              {submitting ? "Đang mở cổng..." : "Truy cập Eden Vault"}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs leading-relaxed text-red-200/70 text-center">
            Tuyệt đối không chia sẻ mã cổng này. Hệ thống lưu vết mọi truy cập. Nếu nghi ngờ lộ mã, hãy đổi <span className="font-semibold text-red-300">ADMIN_ACCESS_KEY</span> ngay.
          </div>
        </div>
      </div>
    </main>
  );
}
