"use client";

import { useEffect, useState } from "react";

const HERO_INTRO_STORAGE_KEY = "edenverse.heroIntro";

export function HeroIntroText({ intro }: { intro: string }) {
  const [visibleIntro, setVisibleIntro] = useState(intro);

  useEffect(() => {
    const storedIntro = localStorage.getItem(HERO_INTRO_STORAGE_KEY)?.trim();
    if (storedIntro) {
      setVisibleIntro(storedIntro);
    }

    function handleIntroUpdate(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail?.trim()) {
        setVisibleIntro(customEvent.detail);
      }
    }

    window.addEventListener("edenverse:hero-intro-updated", handleIntroUpdate);
    return () => window.removeEventListener("edenverse:hero-intro-updated", handleIntroUpdate);
  }, []);

  return <p className="max-w-3xl text-lg leading-8 text-foreground/86 sm:text-xl">{visibleIntro}</p>;
}
