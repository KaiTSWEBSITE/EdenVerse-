import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function GameGallery({
  gallery,
  trailerUrl
}: {
  gallery: string[];
  trailerUrl: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="grid gap-4 p-4 md:grid-cols-3">
            {gallery.map((image, index) => (
              <div key={image} className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
                <Image
                  src={image}
                  alt={`Screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Trailer</p>
            <div className="overflow-hidden rounded-[24px] border border-white/8">
              <iframe
                src={trailerUrl.replace("watch?v=", "embed/")}
                title="Game trailer"
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
