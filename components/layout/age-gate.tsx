"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { useAppStore } from "@/context/app-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function AgeGate() {
  const ageVerified = useAppStore((state) => state.ageVerified);
  const safeMode = useAppStore((state) => state.safeMode);
  const verifyAge = useAppStore((state) => state.verifyAge);
  const toggleSafeMode = useAppStore((state) => state.toggleSafeMode);

  return (
    <Dialog open={!ageVerified}>
      <DialogContent hideClose className="overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(104,196,255,0.22),transparent_35%)]" />
        <div className="relative space-y-6">
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 p-3 text-primary shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">18+ Content Control</p>
            <h2 className="font-display text-4xl text-foreground">Step Into EdenVerse</h2>
            <p className="leading-7 text-muted-foreground">
              This archive includes adult visual novels and mature route metadata. Confirm you are 18+ to continue.
              Safe Mode stays enabled by default until you toggle it off inside your profile or header.
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-accent" />
              <p>
                Safe Mode is currently <span className="font-semibold text-foreground">{safeMode ? "enabled" : "disabled"}</span>.
                You can keep mature games blurred until you choose to reveal them.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={verifyAge}>
              I am 18+ and enter EdenVerse
            </Button>
            <Button className="flex-1" variant="secondary" onClick={toggleSafeMode}>
              {safeMode ? "Keep Safe Mode On" : "Turn Safe Mode Back On"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
