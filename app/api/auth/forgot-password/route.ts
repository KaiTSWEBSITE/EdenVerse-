import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { createCsrfToken } from "@/utils/security";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = forgotPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  return NextResponse.json({
    message: `Password reset flow initialized for ${parsed.data.email}. Connect your mailer to deliver this token.`,
    token: createCsrfToken()
  });
}
