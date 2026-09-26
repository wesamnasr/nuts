"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_in_prod";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "اسم المستخدم وكلمة المرور مطلوبان" };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return { success: false, error: "بيانات الدخول غير صحيحة" };
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return { success: false, error: "بيانات الدخول غير صحيحة" };
    }

    // Create JWT
    const token = await new SignJWT({ id: admin.id, username: admin.username })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .setIssuedAt()
      .sign(encodedSecret);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "حدث خطأ غير متوقع" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return { success: true };
}
