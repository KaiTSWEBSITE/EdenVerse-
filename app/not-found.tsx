import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[-76px] py-20 px-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/eden-cathedral.png"
          alt="Lost in EdenVerse"
          fill
          className="object-cover opacity-20 object-center grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.95)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_50px_rgba(87,188,255,0.2)] mb-8 animate-pulse">
          <MapPinOff className="h-10 w-10" />
        </div>
        
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-primary mb-4 drop-shadow-md">
          Lỗi 404
        </p>
        
        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6 drop-shadow-xl">
          Lạc lối trong <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Thánh Đường</span>
        </h1>
        
        <p className="text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto mb-10">
          Trang bạn tìm kiếm không tồn tại, đã bị xóa hoặc đã chìm vào quên lãng trong những hành lang vô tận của EdenVerse.
        </p>
        
        <Link 
          href="/"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-[0_0_20px_rgba(87,188,255,0.4)] transition-all hover:bg-primary/90 hover:scale-105"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Quay lại trang chủ
        </Link>
      </div>
    </main>
  );
}
