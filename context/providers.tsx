"use client";

import { SessionProvider } from "next-auth/react";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { CaptchaGate } from "@/components/security/captcha-gate";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CaptchaGate>
        <AnalyticsTracker />
        {children}
      </CaptchaGate>
    </SessionProvider>
  );
}
