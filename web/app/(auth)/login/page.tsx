/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { GuestOnly } from "@/components/auth/GuestOnly";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: LoginFormValues) {
    setError("");
    try {
      await auth.login(values.email, values.password);
      toast.success("Đăng nhập thành công", { description: "Chào mừng bạn quay lại FoodiRecipe!" });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Đăng nhập thất bại", { description: error instanceof Error ? error.message : "Vui lòng thử lại." });
      setError(error instanceof Error ? error.message : "Không thể đăng nhập");
    } finally {
    }
  }

  return <GuestOnly><AuthCard title="Chào mừng trở lại" description="Đăng nhập để tiếp tục hành trình bếp núc của bạn." footer={<>Chưa có tài khoản? <Link className="font-semibold text-orange-600 hover:underline" href="/register">Đăng ký ngay</Link></>}>
    <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
      <AuthField id="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <div className="space-y-2">
        <div className="flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">Mật khẩu</label><Link className="text-xs font-semibold text-orange-600 hover:underline" href="/forgot-password">Quên mật khẩu?</Link></div>
        <AuthField id="password" label="" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
    </form>
  </AuthCard></GuestOnly>;
}
