import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function GameGallery({ gallery }: { gallery: string[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
    </section>
  );
}
