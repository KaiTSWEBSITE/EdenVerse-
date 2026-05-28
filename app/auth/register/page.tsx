"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [message, setMessage] = useState("");

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Register</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Join the archive</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Registration route is fully wired for validation and can be switched from demo fallback to Prisma-backed persistence by setting `DATABASE_URL`.
            </p>
          </div>
          <div className="space-y-4">
            <Input placeholder="Email" />
            <Input placeholder="Username" />
            <Input type="password" placeholder="Password" />
            <Button
              className="w-full"
              onClick={async () => {
                const response = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: "newuser@edenverse.gg",
                    username: "newuser",
                    password: "DemoPass123"
                  })
                });
                const data = await response.json();
                setMessage(data.message);
              }}
            >
              Create account
            </Button>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
          </div>
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            Already have an account? Sign in
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
