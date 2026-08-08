import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";

const registerFieldLabels: Record<string, string> = {
  email: "Email",
  username: "Tên người dùng",
  password: "Mật khẩu"
};

function getRegisterValidationResponse(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined>; formErrors: string[] } }) {
  const issues = error.flatten();
  const details = Object.entries(issues.fieldErrors)
    .flatMap(([field, errors]) =>
      (errors ?? []).map((fieldMessage) => `${registerFieldLabels[field] ?? field}: ${fieldMessage}`)
    )
    .concat(issues.formErrors);

  return NextResponse.json(
    {
      message: "Thông tin đăng ký chưa hợp lệ.",
      details,
      issues
    },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:register", {
    max: 20,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json(
      { message: `Bạn tạo tài khoản quá nhanh. Thử lại sau khoảng ${limited.retryAfter ?? 60} giây.` },
      { status: 429 }
    );
  }

  const json = await request.json();
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return getRegisterValidationResponse(parsed.error);
  }

  if (!prisma) {
    return NextResponse.json({
      message: "Đăng ký đã qua kiểm tra, nhưng website chưa kết nối DATABASE_URL để lưu tài khoản."
    });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }]
    },
    select: { id: true }
  });

  if (existingUser) {
    return NextResponse.json({ message: "Email hoặc tên người dùng đã tồn tại." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.username,
      passwordHash
    }
  });

  return NextResponse.json({ message: "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.", userId: user.id }, { status: 201 });
}
