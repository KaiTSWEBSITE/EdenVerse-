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
          <div className="inline-flex rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Kiểm soát nội dung 18+</p>
            <h2 className="font-display text-4xl text-foreground">Vào EdenVerse</h2>
            <p className="leading-7 text-muted-foreground">
              Website có thể hiển thị game Visual Novel dành cho người trưởng thành. Xác nhận bạn đủ 18 tuổi để tiếp tục.
              Chế độ an toàn được bật mặc định để làm mờ nội dung nhạy cảm.
            </p>
          </div>
          <div className="glass-panel rounded-lg p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-accent" />
              <p>
                Chế độ an toàn đang <span className="font-semibold text-foreground">{safeMode ? "bật" : "tắt"}</span>.
                Bạn có thể bật/tắt lại bất cứ lúc nào ở thanh điều hướng.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={verifyAge}>
              Tôi đã đủ 18 tuổi
            </Button>
            <Button className="flex-1" variant="secondary" onClick={toggleSafeMode}>
              {safeMode ? "Giữ chế độ an toàn" : "Bật lại chế độ an toàn"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
