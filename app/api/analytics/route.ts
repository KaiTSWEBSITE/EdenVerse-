import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/services/analytics-service";

export async function GET() {
  const metrics = await getDashboardMetrics();
  return NextResponse.json({ metrics });
}
