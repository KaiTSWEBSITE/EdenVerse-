import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

export function GameGallery({ gallery }: { gallery: string[] }) {
  if (!gallery?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-bold text-foreground">Hình ảnh trò chơi</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((image, index) => (
          <div
            key={image}
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 border border-white/10 group cursor-pointer"
          >
            {/* Blurred Background */}
            <Image
              src={image}
              alt=""
              fill
              aria-hidden
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover opacity-30 blur-2xl scale-110"
            />
            {/* Main Image */}
            <Image
              src={image}
              alt={`Screenshot ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
