"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function getRegisterMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const response = data as { message?: unknown; details?: unknown };
  const message = typeof response.message === "string" ? response.message : fallback;
  const details = Array.isArray(response.details)
    ? response.details.filter((detail): detail is string => typeof detail === "string" && Boolean(detail.trim()))
    : [];

  return details.length ? `${message}\n- ${details.join("\n- ")}` : message;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("Đang tạo tài khoản...");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username
        })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message ?? "Tạo tài khoản thành công. Đang chuyển sang đăng nhập...");
        window.setTimeout(() => router.push("/auth/login"), 700);
        return;
      }

      setMessage(getRegisterMessage(data, "Không thể tạo tài khoản lúc này."));
    } catch {
      setMessage("Không kết nối được máy chủ đăng ký. Kiểm tra mạng rồi thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Đăng ký</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Gia nhập EdenVerse</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Tạo tài khoản bằng email. Mật khẩu cần tối thiểu 8 ký tự, có chữ thường, chữ hoa và số.
            </p>
          </div>

          <form onSubmit={submitRegister} className="space-y-4">
            <Input
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              required
            />
            <Input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tên người dùng, ví dụ kai_user"
              required
            />
            <Input
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Mật khẩu"
              required
            />
            <p className="text-xs leading-6 text-muted-foreground">
              Username chỉ dùng chữ không dấu, số, gạch dưới hoặc gạch ngang. Không dùng khoảng trắng.
            </p>
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
            {message ? (
              <p className="whitespace-pre-line rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary">
                {message}
              </p>
            ) : null}
          </form>

          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            Đã có tài khoản? Đăng nhập
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
