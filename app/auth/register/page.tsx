"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

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
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setIsSuccess(false);
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
        setIsSuccess(true);
        setMessage(data.message ?? "Tạo tài khoản thành công! Đang chuyển sang đăng nhập...");
        window.setTimeout(() => router.push("/auth/login"), 1000);
        return;
      }

      setIsSuccess(false);
      setMessage(getRegisterMessage(data, "Không thể tạo tài khoản lúc này."));
    } catch {
      setIsSuccess(false);
      setMessage("Không kết nối được máy chủ đăng ký. Kiểm tra mạng rồi thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[-76px] py-20 px-4">


      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 sm:p-10 rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl bg-black/40">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Đăng Ký Tài Khoản
            </h1>
            <p className="text-sm text-muted-foreground">
              Gia nhập EdenVerse để lưu trữ game của riêng bạn
            </p>
          </div>

          <form onSubmit={submitRegister} className="space-y-5">
            {message && (
              <div className={`rounded-lg p-3 text-center text-sm whitespace-pre-line border ${isSuccess ? "bg-primary/10 border-primary/20 text-primary" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Email</label>
                <Input
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  required
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary px-4 rounded-xl text-white placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Tên người dùng (Username)</label>
                <Input
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Ví dụ: edengamer"
                  required
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary px-4 rounded-xl text-white placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Mật khẩu</label>
                <Input
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Tối thiểu 8 ký tự, có chữ và số"
                  required
                  className="h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary px-4 rounded-xl text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-[0_0_20px_rgba(87,188,255,0.3)] transition-all mt-4"
            >
              {submitting ? "Đang xử lý..." : "Tạo tài khoản mới"}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="font-semibold text-white hover:text-primary transition underline underline-offset-4">
              Đăng nhập tại đây
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
