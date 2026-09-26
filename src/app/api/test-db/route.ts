import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Attempt a simple query using 'Category' which is guaranteed to exist.
    const categoryCount = await prisma.category.count();

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      data: { categoryCount },
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Debug Route Error:", err);
    return NextResponse.json(
      {
        status: "error",
        message: err.message,
        stack: err.stack,
        hint: "Check server logs for more details",
      },
      { status: 500 },
    );
  }
}
