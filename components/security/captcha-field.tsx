"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CaptchaValue = {
  answer: string;
  provider: "local" | "turnstile";
  token: string;
};

type LocalChallenge = {
  provider: "local";
  question: string;
  token: string;
};

type TurnstileApi = {
  remove: (widgetId?: string) => void;
  render: (
    container: HTMLElement,
    options: {
      action?: string;
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      sitekey: string;
      theme: "dark" | "light" | "auto";
    }
  ) => string;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function CaptchaField({
  action = "submit",
  className,
  label = "Xác minh bảo mật",
  onChange
}: {
  action?: string;
  className?: string;
  label?: string;
  onChange?: (value: CaptchaValue) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [challenge, setChallenge] = useState<LocalChallenge | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [token, setToken] = useState("");
  const callbackRef = useRef(onChange);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    callbackRef.current?.({
      answer,
      provider: TURNSTILE_SITE_KEY ? "turnstile" : "local",
      token: TURNSTILE_SITE_KEY ? token : challenge?.token ?? ""
    });
  }, [answer, challenge?.token, token]);

  useEffect(() => {
    if (TURNSTILE_SITE_KEY) {
      return;
    }

    void loadLocalChallenge();
  }, []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      return;
    }

    const scriptId = "edenverse-turnstile-script";
    const renderTurnstile = () => {
      if (!turnstileContainerRef.current || !window.turnstile || turnstileWidgetRef.current) {
        return;
      }

      turnstileWidgetRef.current = window.turnstile.render(turnstileContainerRef.current, {
        action,
        callback: (nextToken) => setToken(nextToken),
        "error-callback": () => setToken(""),
        "expired-callback": () => setToken(""),
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark"
      });
    };

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", renderTurnstile);

    return () => {
      script?.removeEventListener("load", renderTurnstile);
      if (window.turnstile && turnstileWidgetRef.current) {
        window.turnstile.remove(turnstileWidgetRef.current);
        turnstileWidgetRef.current = null;
      }
    };
  }, [action]);

  async function loadLocalChallenge() {
    setLoadingChallenge(true);
    setAnswer("");
    try {
      const response = await fetch("/api/security/captcha", { cache: "no-store" });
      const data = (await response.json()) as LocalChallenge;
      setChallenge(data);
    } finally {
      setLoadingChallenge(false);
    }
  }

  return (
    <div className={cn("rounded-lg border border-white/10 bg-black/20 p-4", className)}>
      <input name="captchaToken" type="hidden" value={TURNSTILE_SITE_KEY ? token : challenge?.token ?? ""} />
      <input name="captchaAnswer" type="hidden" value={answer} />

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {label}
        </div>
        {!TURNSTILE_SITE_KEY ? (
          <button
            type="button"
            onClick={loadLocalChallenge}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-primary"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loadingChallenge && "animate-spin")} />
            Đổi mã
          </button>
        ) : null}
      </div>

      {TURNSTILE_SITE_KEY ? (
        <div ref={turnstileContainerRef} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">CAPTCHA nội bộ</p>
            <p className="mt-1 font-display text-2xl text-foreground">{challenge?.question ?? "Đang tạo câu hỏi..."}</p>
          </div>
          <Input
            inputMode="numeric"
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Nhập đáp án"
            value={answer}
          />
        </div>
      )}

      {!TURNSTILE_SITE_KEY ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Có thể thay CAPTCHA nội bộ bằng Cloudflare Turnstile bằng cách thêm `NEXT_PUBLIC_TURNSTILE_SITE_KEY` và
          `TURNSTILE_SECRET_KEY`.
        </p>
      ) : null}
    </div>
  );
}

export type { CaptchaValue };
