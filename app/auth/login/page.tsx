"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@edenverse.gg");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Authentication</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Welcome back</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Demo credentials are prefilled. Email/password works immediately, while Google and Discord become available once you add OAuth secrets.
            </p>
          </div>
          <div className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button
              className="w-full"
              onClick={async () => {
                const result = await signIn("credentials", {
                  email,
                  password,
                  redirect: false
                });

                if (result?.error) {
                  setError("Invalid credentials.");
                  return;
                }

                router.push("/dashboard");
              }}
            >
              Login
            </Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => signIn("google")}>
                Continue with Google
              </Button>
              <Button variant="secondary" onClick={() => signIn("discord")}>
                Continue with Discord
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link href="/auth/register" className="hover:text-foreground">Create account</Link>
            <Link href="/auth/forgot-password" className="hover:text-foreground">Forgot password</Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
