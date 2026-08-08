import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">404</p>
          <h1 className="font-display text-6xl text-foreground">Lost in the cathedral</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            The page you reached either moved, expired, or never existed in this wing of EdenVerse.
          </p>
          <Link href="/">
            <Button>Return home</Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
