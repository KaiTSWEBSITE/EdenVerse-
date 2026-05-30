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

  if (callbackUrl.startsWith("/admin") || callbackUrl.startsWith("/eden-vault")) {
    return "/profile";
  }

  return callbackUrl;
}

function getProfileUrl(username?: string | null) {
  return (username ? `/profile/${username}` : "/profile") as Route;
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
    if (status === "authenticated") {
      router.replace(getProfileUrl(session?.user?.username));
    }
  }, [router, session?.user?.username, status]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Nh?p email v? m?t kh?u tr??c ?? nh?.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("?ang ki?m tra t?i kho?n...");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        rememberMe,
        redirect: false
      });

      if (result?.error) {
        setSuccess("");
        setError("Email ho?c m?t kh?u ch?a ??ng.");
        return;
      }

      const latestSession = await getSession();
      const username = latestSession?.user?.username;

      setSuccess("??ng nh?p th?nh c?ng, ?ang m? h? s? c?a b?n...");
      router.push((getSafeCallbackUrl() === "/profile" ? getProfileUrl(username) : getSafeCallbackUrl()) as Route);
      router.refresh();
    } catch {
      setSuccess("");
      setError("Kh?ng th? ??ng nh?p l?c n?y, th? t?i l?i trang r?i ??ng nh?p l?i.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">??ng nh?p</p>
            <h1 className="font-display text-4xl text-foreground">?ang ki?m tra phi?n ??ng nh?p...</h1>
            <p className="text-sm leading-7 text-muted-foreground">N?u b?n ?? ??ng nh?p, h? th?ng s? ??a b?n v? h? s? c? nh?n.</p>
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
            <p className="text-xs uppercase tracking-[0.22em] text-primary">T?i kho?n</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Ch?o m?ng tr? l?i</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              ??ng nh?p ?? l?u game y?u th?ch, ch?nh h? s? v? theo d?i c?c b?n c?p nh?t m?i nh?t tr?n EdenVerse.
            </p>
          </div>

          <form onSubmit={submitLogin} className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="M?t kh?u" />
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-black/40"
              />
              Gi? ??ng nh?p tr?n thi?t b? n?y
            </label>
            {success ? <p className="rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">{success}</p> : null}
            {error ? <p className="rounded-lg border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">{error}</p> : null}
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? "?ang ki?m tra..." : "??ng nh?p"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/register" className="hover:text-foreground">
              T?o t?i kho?n
            </Link>
            <Link href="/auth/forgot-password" className="hover:text-foreground">
              Qu?n m?t kh?u
            </Link>
          </div>

          <p className="rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-xs leading-6 text-muted-foreground">
            Khu qu?n tr? kh?ng ??ng nh?p t?i trang n?y. N?u b?n l? ch? s? h?u, h?y d?ng c?ng qu?n tr? ri?ng.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
