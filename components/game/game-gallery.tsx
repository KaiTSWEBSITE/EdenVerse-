import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function GameGallery({ gallery }: { gallery: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          {gallery.map((image, index) => (
            <div key={image} className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-[#050912]">
              <Image
                src={image}
                alt=""
                fill
                aria-hidden
                sizes="(max-width: 768px) 100vw, 33vw"
                className="scale-110 object-cover opacity-35 blur-2xl"
              />
              <Image
                src={image}
                alt={`Screenshot ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain transition duration-500 hover:scale-[1.015]"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
