"use client";

import Link from "next/link";
import { useState } from "react";
import { CaptchaField, type CaptchaValue } from "@/components/security/captcha-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [captcha, setCaptcha] = useState<CaptchaValue | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");

  const captchaReady = Boolean(captcha?.token && (captcha.provider === "turnstile" || captcha.answer));

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng ký</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Gia nhập EdenVerse</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Tạo tài khoản bằng email. Mật khẩu cần tối thiểu 8 ký tự, có chữ hoa và số.
            </p>
          </div>
          <div className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Tên người dùng" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Mật khẩu" />
            <CaptchaField action="register" onChange={setCaptcha} />
            <Button
              className="w-full"
              disabled={!captchaReady || submitting}
              onClick={async () => {
                setSubmitting(true);
                const response = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    captchaAnswer: captcha?.answer ?? "",
                    captchaToken: captcha?.token ?? "",
                    email,
                    password,
                    username
                  })
                });
                const data = await response.json();
                setSubmitting(false);
                setMessage(data.message ?? "Không thể tạo tài khoản lúc này.");
              }}
            >
              {submitting ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
          </div>
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            Đã có tài khoản? Đăng nhập
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
