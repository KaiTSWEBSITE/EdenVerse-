"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type CaptchaStatus = "checking" | "ready" | "verifying" | "passed" | "error" | "misconfigured";

type TurnstileRenderOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SESSION_KEY = "edenverse:captcha:verified";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const captchaSwitch = process.env.NEXT_PUBLIC_CAPTCHA_ENABLED;
const shouldUseCaptcha = captchaSwitch === "true" || (captchaSwitch !== "false" && Boolean(siteKey));

export function CaptchaGate({ children }: { children: React.ReactNode }) {
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<CaptchaStatus>("checking");
  const [message, setMessage] = useState("Đang chuẩn bị cổng xác minh...");

  useEffect(() => {
    if (!shouldUseCaptcha) {
      setStatus("passed");
      return;
    }

    if (!siteKey) {
      setStatus("misconfigured");
      setMessage("Captcha chưa có site key. Hãy thêm NEXT_PUBLIC_TURNSTILE_SITE_KEY trên Vercel.");
      return;
    }

    if (window.sessionStorage.getItem(SESSION_KEY) === "true") {
      setStatus("passed");
      return;
    }

    setStatus("ready");
    setMessage("Xác minh nhanh để bước vào EdenVerse.");
  }, []);

  useEffect(() => {
    if (!scriptReady || status !== "ready" || !containerRef.current || widgetRef.current || !window.turnstile) {
      return;
    }

    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      size: "flexible",
      callback: async (token) => {
        setStatus("verifying");
        setMessage("Đang xác nhận với EdenVerse Shield...");

        try {
          const response = await fetch("/api/security/captcha/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
          });

          const data = (await response.json().catch(() => null)) as { message?: string } | null;

          if (!response.ok) {
            throw new Error(data?.message || "Captcha không hợp lệ, thử lại giúp mình nhé.");
          }

          window.sessionStorage.setItem(SESSION_KEY, "true");
          setStatus("passed");
        } catch (error) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Không xác minh được captcha.");
          if (widgetRef.current && window.turnstile) {
            window.turnstile.reset(widgetRef.current);
          }
        }
      },
      "error-callback": () => {
        setStatus("error");
        setMessage("Widget captcha bị lỗi tải. Kiểm tra mạng rồi thử lại.");
      },
      "expired-callback": () => {
        setStatus("ready");
        setMessage("Captcha đã hết hạn, bấm xác minh lại một lần nữa.");
      }
    });
  }, [scriptReady, status]);

  useEffect(() => {
    return () => {
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
      }
    };
  }, []);

  const locked = status !== "passed";

  return (
    <>
      {shouldUseCaptcha && siteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
          onError={() => {
            setStatus("error");
            setMessage("Không tải được captcha. Hãy thử tắt VPN/adblock hoặc tải lại trang.");
          }}
        />
      ) : null}
      {children}
      {locked ? (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black/76 px-4 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(91,203,255,0.22),transparent_24%),radial-gradient(circle_at_18%_72%,rgba(209,160,88,0.14),transparent_30%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-primary/25 bg-[#07101a]/92 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:p-8">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent/12 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-glow">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.34em] text-primary">EdenVerse Shield</p>
                  <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Xác minh truy cập</h2>
                </div>
              </div>

              <p className="mb-6 leading-7 text-muted-foreground">
                Để chặn bot và request bẩn, EdenVerse sẽ yêu cầu xác minh mỗi phiên truy cập mới. Sau khi qua cửa,
                bạn dùng web bình thường trong phiên hiện tại.
              </p>

              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                {status === "misconfigured" ? (
                  <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
                    {message}
                  </div>
                ) : (
                  <div ref={containerRef} className="min-h-[70px] w-full" />
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {message}
                </span>
                {status === "error" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setStatus("ready");
                      setMessage("Xác minh nhanh để bước vào EdenVerse.");
                    }}
                  >
                    Thử lại
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
