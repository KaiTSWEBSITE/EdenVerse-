"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Recovery</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Reset your access</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Demo flow returns a success message immediately. In production, this route is ready to connect to your email service and verification token pipeline.
            </p>
          </div>
          <div className="space-y-4">
            <Input placeholder="Email address" />
            <Button
              className="w-full"
              onClick={async () => {
                const response = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: "aria@edenverse.gg" })
                });
                const data = await response.json();
                setMessage(data.message);
              }}
            >
              Send reset link
            </Button>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
