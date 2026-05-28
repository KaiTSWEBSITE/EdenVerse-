"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaptchaField, type CaptchaValue } from "@/components/security/captcha-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [captcha, setCaptcha] = useState<CaptchaValue | null>(null);
  const [email, setEmail] = useState("admin@edenverse.gg");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const captchaReady = Boolean(captcha?.token && (captcha.provider === "turnstile" || captcha.answer));

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng nhập</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Chào mừng trở lại</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Đăng nhập bằng email và mật khẩu. EdenVerse đã thêm CAPTCHA, rate limit và cookie an toàn để giảm spam đăng nhập.
            </p>
          </div>

          <div className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Mật khẩu" />
            <CaptchaField action="login" onChange={setCaptcha} />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button
              className="w-full"
              disabled={!captchaReady || submitting}
              onClick={async () => {
                setSubmitting(true);
                setError("");

                const result = await signIn("credentials", {
                  captchaAnswer: captcha?.answer ?? "",
                  captchaToken: captcha?.token ?? "",
                  email,
                  password,
                  redirect: false
                });

                setSubmitting(false);

                if (result?.error) {
                  setError("Email, mật khẩu hoặc CAPTCHA chưa đúng.");
                  return;
                }

                router.push("/dashboard");
              }}
            >
              {submitting ? "Đang kiểm tra..." : "Đăng nhập"}
            </Button>
          </div>

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
