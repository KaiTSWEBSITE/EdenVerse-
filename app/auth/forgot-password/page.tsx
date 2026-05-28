"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Khôi phục</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Đặt lại quyền truy cập</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Nhập email tài khoản để bắt đầu luồng đặt lại mật khẩu.
            </p>
          </div>
          <div className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Địa chỉ email" />
            <Button
              className="w-full"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                const response = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email })
                });
                const data = await response.json();
                setSubmitting(false);
                setMessage(data.message ?? "Không thể gửi yêu cầu lúc này.");
              }}
            >
              {submitting ? "Đang gửi..." : "Gửi link đặt lại"}
            </Button>
            {message ? <p className="text-sm text-primary">{message}</p> : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
