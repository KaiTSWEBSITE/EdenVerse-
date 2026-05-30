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
      setError("Nh?p ?? m? c?ng, email v? m?t kh?u qu?n tr?.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("?ang ki?m tra c?ng qu?n tr?...");

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
        setError("Kh?ng m? ???c c?ng qu?n tr?. Ki?m tra l?i m? c?ng ho?c t?i kho?n.");
        return;
      }

      const latestSession = await getSession();
      const latestRole = latestSession?.user?.role ?? "USER";
      const latestVaultAccess = latestSession?.user?.adminVaultPassed === true;

      if ((latestRole !== "ADMIN" && latestRole !== "SUPER_ADMIN") || !latestVaultAccess) {
        await signOut({ redirect: false });
        setSuccess("");
        setError("T?i kho?n n?y kh?ng c? quy?n qu?n tr?.");
        return;
      }

      setSuccess("C?ng qu?n tr? ?? m?, ?ang chuy?n v?o b?ng ?i?u khi?n...");
      router.push(getSafeAdminCallbackUrl() as Route);
      router.refresh();
    } catch {
      setSuccess("");
      setError("Kh?ng th? m? c?ng qu?n tr? l?c n?y, th? t?i l?i trang r?i ??ng nh?p l?i.");
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
            <h1 className="font-display text-4xl text-foreground">?ang x?c th?c quy?n qu?n tr?...</h1>
            <p className="text-sm leading-7 text-muted-foreground">N?u phi?n h?p l?, h? th?ng s? t? chuy?n v?o b?ng ?i?u khi?n.</p>
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
            <h1 className="mt-2 font-display text-5xl text-foreground">C?ng qu?n tr? ri?ng</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Trang n?y d?ng th?m m? c?ng ?? ng?n t?i kho?n qu?n tr? b? th? ??ng nh?p t? form c?ng khai.
            </p>
          </div>

          <form onSubmit={submitVaultLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                type="password"
                placeholder="M? c?ng qu?n tr?"
                className="pl-11"
              />
            </div>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email admin" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="M?t kh?u admin" />
            {success ? <p className="rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">{success}</p> : null}
            {error ? <p className="rounded-lg border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? "?ang m? c?ng..." : "M? Eden Vault"}
            </Button>
          </form>

          <p className="rounded-xl border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-xs leading-6 text-amber-100/80">
            Kh?ng chia s? m? c?ng n?y. N?u nghi ng? b? l?, ??i bi?n m?i tr??ng <span className="font-semibold">ADMIN_ACCESS_KEY</span> tr?n Vercel ngay.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
