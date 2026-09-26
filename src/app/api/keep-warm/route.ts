import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  // Protect with CRON_SECRET from env
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Lightweight query to keep DB alive
    const setting = await prisma.setting.findFirst();

    return NextResponse.json({
      success: true,
      message: "Database warmed up",
      timestamp: new Date().toISOString(),
      settingKey: setting?.key,
    });
  } catch (error) {
    console.error("Keep-warm failed:", error);
    return NextResponse.json(
      { success: false, error: "Warm-up failed" },
      { status: 500 },
    );
  }
}
