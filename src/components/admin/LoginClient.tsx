"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, User } from "lucide-react";

export function LoginClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    if (result.success) {
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/admin");
      router.refresh();
    } else {
      toast.error(result.error || "فشل تسجيل الدخول");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF7F11]/10 text-[#FF7F11] mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-cairo">تسجيل الدخول للإدارة</h1>
          <p className="text-neutral-500 mt-2 text-sm">أدخل بيانات الاعتماد للمتابعة</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="font-cairo">اسم المستخدم</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input 
                name="username" 
                placeholder="أدخل اسم المستخدم"
                className="pr-10 h-12 rounded-xl text-right font-cairo"
                dir="rtl"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-cairo">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input 
                type="password"
                name="password" 
                placeholder="أدخل كلمة المرور"
                className="pr-10 h-12 rounded-xl text-right font-cairo"
                dir="rtl"
                required 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-[#FF7F11] hover:bg-[#e66a00] text-white font-bold text-lg mt-6 font-cairo"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "تسجيل الدخول"}
          </Button>
        </form>
      </div>
    </div>
  );
}
