"use client";

import type { Route } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Eden Vault
            </p>
            <h1 className="font-display text-4xl text-foreground">Đang xác thực quyền quản trị...</h1>
            <p className="text-sm leading-7 text-muted-foreground">Nếu phiên hợp lệ, hệ thống sẽ tự chuyển vào bảng điều khiển.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(145deg,rgba(8,14,24,0.94),rgba(4,6,10,0.92))] shadow-[0_0_80px_rgba(91,203,255,0.12)]">
        <CardContent className="space-y-6 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_34px_rgba(91,203,255,0.22)]">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Eden Vault</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Cổng quản trị riêng</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Trang này dùng thêm mã cổng để ngăn tài khoản quản trị bị thử đăng nhập từ form công khai.
            </p>
          </div>

          <form onSubmit={submitVaultLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                type="password"
                placeholder="Mã cổng quản trị"
                className="pl-11"
              />
            </div>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email admin" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Mật khẩu admin" />
            {success ? <p className="rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">{success}</p> : null}
            {error ? <p className="rounded-lg border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? "Đang mở cổng..." : "Mở Eden Vault"}
            </Button>
          </form>

          <p className="rounded-xl border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-xs leading-6 text-amber-100/80">
            Không chia sẻ mã cổng này. Nếu nghi ngờ bị lộ, đổi biến môi trường <span className="font-semibold">ADMIN_ACCESS_KEY</span> trên Vercel ngay.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
