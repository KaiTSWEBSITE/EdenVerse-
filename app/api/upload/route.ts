import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file received" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "public/uploads");
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name) || ".bin";
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(uploadDir, safeName), buffer);

  return NextResponse.json({
    message: "Upload saved locally.",
    url: `/${path.posix.join((process.env.UPLOAD_DIR ?? "public/uploads").replace(/^public\//, ""), safeName)}`,
    extension
  });
}
