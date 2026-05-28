"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useAppStore } from "@/context/app-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const themeVariant = useAppStore((state) => state.themeVariant);

  useEffect(() => {
    document.documentElement.dataset.theme = themeVariant;
    document.documentElement.classList.add("dark");
  }, [themeVariant]);

  return <SessionProvider>{children}</SessionProvider>;
}
